"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { checkAccess, GitHubError, readFile, readRaw, TRACKER_PATH, writeFile } from "./github";
import { emptyTracker, type RadarJob, type RadarMeta, type Tracker } from "./types";

const TOKEN_KEY = "dashboard-token";

type Collection = "contacts" | "jobs" | "brokers" | "templates";

export type DashboardState =
  | { status: "signed-out"; error?: string }
  | { status: "loading" }
  | { status: "ready"; jobs: RadarJob[]; meta: RadarMeta | null; tracker: Tracker };

function storedToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null, remember = false) {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
    if (token) (remember ? window.localStorage : window.sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    // Storage blocked: the session just won't survive a reload.
  }
}

// Newest edit wins, record by record, so saving from two devices never drops anything.
function merge(remote: Tracker, local: Tracker): Tracker {
  const pick = <T extends { id: string; updatedAt: string }>(a: T[], b: T[]) => {
    const byId = new Map(a.map((item) => [item.id, item]));
    for (const item of b) {
      const other = byId.get(item.id);
      if (!other || item.updatedAt > other.updatedAt) byId.set(item.id, item);
    }
    return [...byId.values()];
  };
  return {
    version: 1,
    contacts: pick(remote.contacts, local.contacts),
    jobs: pick(remote.jobs, local.jobs),
    brokers: pick(remote.brokers, local.brokers),
    templates: pick(remote.templates, local.templates),
  };
}

function normalize(tracker: Partial<Tracker> | null): Tracker {
  return { ...emptyTracker(), ...tracker, version: 1 };
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({ status: "loading" });
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const token = useRef<string | null>(null);
  const sha = useRef<string | null>(null);
  const tracker = useRef<Tracker>(emptyTracker());
  const queue = useRef<Promise<void>>(Promise.resolve());

  const load = useCallback(async () => {
    if (!token.current) return;
    setState({ status: "loading" });
    try {
      const [jobs, meta, file] = await Promise.all([
        readRaw<RadarJob[]>(token.current, "data/jobs.json"),
        readRaw<RadarMeta>(token.current, "data/meta.json"),
        readFile<Tracker>(token.current, TRACKER_PATH),
      ]);
      sha.current = file?.sha ?? null;
      tracker.current = normalize(file?.data ?? null);
      setState({ status: "ready", jobs: jobs ?? [], meta, tracker: tracker.current });
    } catch (error) {
      const expired = error instanceof GitHubError && (error.status === 401 || error.status === 403);
      if (expired) {
        token.current = null;
        storeToken(null);
      }
      setState({ status: "signed-out", error: expired ? "Tokenul a fost refuzat sau a expirat." : `Nu am putut încărca datele: ${(error as Error).message}` });
    }
  }, []);

  useEffect(() => {
    token.current = storedToken();
    if (token.current) void load();
    else setState({ status: "signed-out" });
  }, [load]);

  const signIn = useCallback(
    async (value: string, remember: boolean) => {
      try {
        await checkAccess(value);
      } catch {
        setState({ status: "signed-out", error: "Tokenul nu are acces la Sadovei/job-radar. Verifică repository access și permisiunile." });
        return;
      }
      token.current = value;
      storeToken(value, remember);
      await load();
    },
    [load],
  );

  const signOut = useCallback(() => {
    token.current = null;
    storeToken(null);
    setState({ status: "signed-out" });
  }, []);

  // Apply a change locally right away, then write it to the repo (one write at a time)
  const update = useCallback(<T extends { id: string }>(collection: Collection, item: T, deleted = false) => {
    const stamped = { ...item, updatedAt: new Date().toISOString(), ...(deleted ? { deleted: true } : {}) };
    const list = tracker.current[collection] as unknown as (T & { updatedAt: string })[];
    const next = { ...tracker.current, [collection]: [...list.filter((x) => x.id !== item.id), stamped] } as Tracker;
    tracker.current = next;
    setState((current) => (current.status === "ready" ? { ...current, tracker: next } : current));

    queue.current = queue.current.then(async () => {
      const auth = token.current;
      if (!auth) return;
      setSaving("saving");
      const message = `Dashboard: ${deleted ? "delete" : "update"} ${collection.replace(/s$/, "")}`;
      try {
        try {
          sha.current = await writeFile(auth, TRACKER_PATH, tracker.current, sha.current, message);
        } catch (error) {
          // Another device saved in between: merge with that version and retry once
          if (!(error instanceof GitHubError && (error.status === 409 || error.status === 422))) throw error;
          const remote = await readFile<Tracker>(auth, TRACKER_PATH);
          tracker.current = merge(normalize(remote?.data ?? null), tracker.current);
          sha.current = await writeFile(auth, TRACKER_PATH, tracker.current, remote?.sha ?? null, message);
          setState((current) => (current.status === "ready" ? { ...current, tracker: tracker.current } : current));
        }
        setSaving("saved");
      } catch {
        // Keep the queue alive; the change stays on screen and goes out with the next save
        setSaving("error");
      }
    });
  }, []);

  return { state, saving, signIn, signOut, reload: load, update, token };
}
