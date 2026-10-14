"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Brokers } from "./brokers";
import styles from "./dashboard.module.css";
import { refLink } from "./format";
import { runRadar } from "./github";
import { Jobs } from "./jobs";
import { blankContact, Outreach } from "./outreach";
import { Overview } from "./overview";
import { Templates } from "./templates";
import type { Contact, RadarJob } from "./types";
import { useDashboard } from "./use-dashboard";
import { ThemeToggle } from "@/components/theme-toggle";

const TABS = { overview: "Overview", jobs: "Job-uri", outreach: "Outreach", brokers: "Brokeri", templates: "Șabloane" } as const;
type Tab = keyof typeof TABS;

function useHashTab(): [Tab, (tab: Tab) => void] {
  const [tab, setTab] = useState<Tab>("overview");
  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.slice(1);
      setTab(hash in TABS ? (hash as Tab) : "overview");
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return [tab, (next) => (window.location.hash = next)];
}

function SignIn({ onSubmit, error }: { onSubmit: (token: string, remember: boolean) => void; error?: string }) {
  const [token, setToken] = useState("");
  const [remember, setRemember] = useState(true);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (token.trim()) onSubmit(token.trim(), remember);
  };
  return (
    <main className={styles.main}>
      <form className={styles.signin} onSubmit={submit}>
        <h1>Dashboard</h1>
        <p className={styles.muted}>Datele stau în repo-ul privat Sadovei/job-radar. Intri cu un token GitHub care are acces doar la el.</p>
        <ol>
          <li>
            GitHub → Settings → Developer settings → Personal access tokens → <strong>Fine-grained tokens</strong> → Generate new token.
          </li>
          <li>
            Repository access: <strong>Only select repositories → Sadovei/job-radar</strong>.
          </li>
          <li>
            Permissions: <strong>Contents: Read and write</strong> și <strong>Actions: Read and write</strong> (pentru „Rulează radarul”).
          </li>
          <li>Expiration: 90 de zile. Copiezi tokenul și îl lipești mai jos.</li>
        </ol>
        <label className={styles.field}>
          <span>Token GitHub</span>
          <input className={styles.input} type="password" autoComplete="off" spellCheck={false} value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_…" />
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Ține-mă minte pe acest dispozitiv
        </label>
        <button type="submit" className={styles.btn}>
          Intră
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </main>
  );
}

export function Dashboard() {
  const { state, saving, signIn, signOut, reload, update, token } = useDashboard();
  const [tab, setTab] = useHashTab();
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [radarState, setRadarState] = useState<"idle" | "running" | "started" | "error">("idle");

  if (state.status === "loading") return <p className={styles.empty}>Se încarcă datele…</p>;
  if (state.status === "signed-out") return <SignIn onSubmit={signIn} error={state.error} />;

  const { tracker, jobs, meta } = state;

  const toOutreach = (job: RadarJob) => {
    setTab("outreach");
    setEditingContact(
      blankContact({
        company: job.company,
        stage: "to_contact",
        role: "hiring_manager",
        jobId: job.id,
        refLink: job.company ? refLink(job.company) : "",
        notes: `${job.title} · ${job.location}\n${job.url}`,
      }),
    );
  };

  const onRunRadar = async () => {
    if (!token.current) return;
    setRadarState("running");
    try {
      await runRadar(token.current);
      setRadarState("started");
    } catch {
      setRadarState("error");
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <span className={styles.brand}>Dashboard</span>
          <nav aria-label="Secțiuni">
            <ul className={styles.tabs}>
              {(Object.keys(TABS) as Tab[]).map((key) => (
                <li key={key}>
                  <button type="button" className={styles.tab} aria-current={tab === key ? "page" : undefined} onClick={() => setTab(key)}>
                    {TABS[key]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.barEnd}>
            <span role="status">{saving === "saving" ? "Se salvează…" : saving === "saved" ? "Salvat ✓" : saving === "error" ? "Eroare la salvare" : ""}</span>
            <button type="button" className={styles.btnSmall} onClick={() => void reload()}>
              Reîncarcă
            </button>
            <button type="button" className={styles.btnSmall} onClick={signOut}>
              Ieși
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {tab === "overview" && (
          <Overview
            jobs={jobs}
            meta={meta}
            contacts={tracker.contacts}
            marks={tracker.jobs}
            onOpenContact={(c) => {
              setTab("outreach");
              setEditingContact(c);
            }}
            onGo={(next) => setTab(next as Tab)}
            onRunRadar={onRunRadar}
            radarState={radarState}
          />
        )}
        {tab === "jobs" && <Jobs jobs={jobs} marks={tracker.jobs} onMark={(mark) => update("jobs", mark)} onOutreach={toOutreach} />}
        {tab === "outreach" && (
          <Outreach contacts={tracker.contacts} onSave={(c, deleted) => update("contacts", c, deleted)} editing={editingContact} setEditing={setEditingContact} />
        )}
        {tab === "brokers" && <Brokers brokers={tracker.brokers} onSave={(b, deleted) => update("brokers", b, deleted)} />}
        {tab === "templates" && <Templates templates={tracker.templates} onSave={(t, deleted) => update("templates", t, deleted)} />}
      </main>
    </div>
  );
}
