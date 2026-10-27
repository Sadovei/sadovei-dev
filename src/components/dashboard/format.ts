export const today = () => new Date().toISOString().slice(0, 10);

export const daysBefore = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

export const newId = () => crypto.randomUUID();

export function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
}

export function daysAgo(value: string) {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  return days <= 0 ? "azi" : days === 1 ? "ieri" : `acum ${days} zile`;
}

export function pay(job: { bucket: string; dayRateEur?: number; annualEur?: number }) {
  if (job.bucket === "contract" && job.dayRateEur) return `~€${Math.round(job.dayRateEur / 5) * 5}/zi`;
  if (job.annualEur) return `~€${Math.round(job.annualEur / 1000)}k/an`;
  return "";
}

export function slug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const refLink = (company: string) => `https://sadovei.dev/?ref=${slug(company)}`;

// Every ?ref= value a contact may have received: the saved link, any link in the message, and the company slug
export function refsOf(contact: { refLink: string; message: string; company: string }) {
  const refs = new Set<string>();
  for (const text of [contact.refLink, contact.message]) {
    for (const match of (text ?? "").matchAll(/[?&]ref=([\w-]+)/g)) refs.add(match[1].toLowerCase());
  }
  if (contact.company) refs.add(slug(contact.company));
  return refs;
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  URL.revokeObjectURL(url);
}

export async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
