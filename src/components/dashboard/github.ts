// Minimal GitHub REST client for the private data repo. The token never leaves the browser except to api.github.com.
export const REPO = "Sadovei/job-radar";
export const TRACKER_PATH = "tracker/tracker.json";
const API = `https://api.github.com/repos/${REPO}`;

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function call(token: string, path: string, init: RequestInit = {}, accept = "application/vnd.github+json") {
  const res = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: accept,
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new GitHubError((detail as { message?: string }).message ?? res.statusText, res.status);
  }
  return res;
}

function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

export async function checkAccess(token: string) {
  await call(token, "");
}

export async function readRaw<T>(token: string, path: string): Promise<T | null> {
  try {
    const res = await call(token, `/contents/${path}`, {}, "application/vnd.github.raw+json");
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

export async function readFile<T>(token: string, path: string): Promise<{ data: T; sha: string } | null> {
  try {
    const res = await call(token, `/contents/${path}`);
    const file = (await res.json()) as { content: string; sha: string };
    return { data: JSON.parse(fromBase64(file.content)) as T, sha: file.sha };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

export async function writeFile(token: string, path: string, data: unknown, sha: string | null, message: string) {
  const res = await call(token, `/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: toBase64(`${JSON.stringify(data, null, 1)}\n`), branch: "main", ...(sha ? { sha } : {}) }),
  });
  const result = (await res.json()) as { content: { sha: string } };
  return result.content.sha;
}

export async function runRadar(token: string) {
  await call(token, "/actions/workflows/radar.yml/dispatches", { method: "POST", body: JSON.stringify({ ref: "main" }) });
}
