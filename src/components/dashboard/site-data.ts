import { refsOf } from "./format";
import type { Contact, SiteStats } from "./types";

export type ContactVisits = { visits: number; firstDay: string; lastDay: string; refs: string[] };

// Visits that came through a contact's ?ref= link. Days before the message was sent are ignored:
// those are usually you, testing the link.
export function contactVisits(contact: Contact, stats: SiteStats | null): ContactVisits | null {
  if (!stats) return null;
  const refs = refsOf(contact);
  const since = contact.sentAt?.slice(0, 10) ?? "";
  let visits = 0;
  let firstDay = "";
  let lastDay = "";
  const matched: string[] = [];
  for (const ref of stats.referrers) {
    if (ref.scheme !== "c" || !refs.has(ref.name.toLowerCase())) continue;
    for (const [day, count] of Object.entries(ref.byDay)) {
      if (day < since || !count) continue;
      visits += count;
      if (!firstDay || day < firstDay) firstDay = day;
      if (day > lastDay) lastDay = day;
      if (!matched.includes(ref.name)) matched.push(ref.name);
    }
  }
  return visits ? { visits, firstDay, lastDay, refs: matched } : null;
}

export const SCHEMES: Record<string, string> = { c: "Link cu ?ref", h: "Site", g: "Grupat", o: "Aplicație", "": "Fără sursă" };

export const NO_REFERRER = "Fără sursă (direct, aplicații, PDF)";

// Click events on the site, grouped by the data-track prefix used in the components
const EVENT_GROUPS: [prefix: string, label: string][] = [
  ["download-cv", "Descărcări CV"],
  ["book-call", "Click pe „Book a call”"],
  ["email", "Click pe email"],
  ["linkedin", "Click pe LinkedIn"],
  ["live-", "Demo-uri live deschise"],
];

export function eventGroups(events: SiteStats["events"]) {
  const groups = EVENT_GROUPS.map(([, label]) => ({ label, total: 0, items: [] as SiteStats["events"] }));
  const other = { label: "Alte click-uri", total: 0, items: [] as SiteStats["events"] };
  for (const event of events) {
    const index = EVENT_GROUPS.findIndex(([prefix]) => event.name.startsWith(prefix));
    const group = index >= 0 ? groups[index] : other;
    group.total += event.count;
    group.items.push(event);
  }
  return [...groups, other].filter((g) => g.total);
}

export const eventTotal = (events: SiteStats["events"], prefix: string) => events.filter((e) => e.name.startsWith(prefix)).reduce((sum, e) => sum + e.count, 0);

// GoatCounter sends the size kind as an id (phone, tablet…); the long names are kept in case it ever sends those
const SIZES: Record<string, string> = {
  phone: "Telefoane",
  tablet: "Tablete",
  desktop: "Monitoare",
  desktophd: "Monitoare mari",
  unknown: "Necunoscut",
  Phones: "Telefoane",
  "Large phones, small tablets": "Telefoane mari, tablete mici",
  "Tablets and small laptops": "Tablete, laptopuri mici",
  "Computer monitors": "Monitoare",
  "Computer monitors larger than HD": "Monitoare mari",
};
export const sizeLabel = (name: string) => SIZES[name] ?? (/unknown|necunoscut/i.test(name) ? "Necunoscut" : name);

// Three clean y-axis ticks (0, step, 2·step) that cover the highest value
export function yTicks(max: number) {
  const steps = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100];
  let scale = 1;
  for (;;) {
    for (const s of steps) if (2 * s * scale >= max) return [0, s * scale, 2 * s * scale];
    scale *= 10;
  }
}
