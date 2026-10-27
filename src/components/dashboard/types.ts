// Radar output (written by Sadovei/job-radar)
export type RadarJob = {
  id: string;
  source: string;
  title: string;
  company: string;
  url: string;
  location: string;
  bucket: "contract" | "full_time" | "company";
  score: number;
  reasons: string[];
  flags: string[];
  dayRateEur?: number;
  annualEur?: number;
  firstSeen: string;
  postedAt: string;
};

export type RadarMeta = {
  lastRun: string;
  sources: { name: string; jobs?: number; error?: string }[];
  fullTimeFloorEur: number;
};

// Site analytics (written by Sadovei/job-radar from GoatCounter every 3 hours)
export type SiteStats = {
  generatedAt: string;
  site: string;
  days: number;
  start: string;
  end: string;
  totals: { visits: number; events: number; noReferrer: number };
  daily: { day: string; visits: number }[];
  pages: { path: string; title: string; visits: number }[];
  events: { name: string; title: string; count: number }[];
  // scheme: c = ?ref= link, h = website, g = grouped (Google, Email…), o = app; empty name = no referrer
  referrers: { name: string; scheme: string; visits: number; firstDay: string; lastDay: string; byDay: Record<string, number> }[];
  locations: { name: string; visits: number }[];
  sizes: { name: string; visits: number }[];
};

// Tracker (written by the dashboard). Records are never removed, only marked deleted, so edits from two devices merge cleanly.
type Base = { id: string; updatedAt: string; deleted?: boolean };

export const STAGES = {
  to_contact: "De contactat",
  sent: "Trimis",
  replied: "A răspuns",
  call: "Call",
  interview: "Interviu",
  offer: "Ofertă",
  won: "Câștigat",
  lost: "Pierdut",
  no_reply: "Fără răspuns",
} as const;
export type Stage = keyof typeof STAGES;

export const ROLES = {
  recruiter: "Recruiter",
  hiring_manager: "Hiring manager",
  cto: "CTO / Head of Eng",
  broker: "Broker",
  colleague: "Fost coleg",
  founder: "Founder",
  other: "Altul",
} as const;

export const CHANNELS = {
  linkedin: "LinkedIn (conexiune)",
  inmail: "LinkedIn InMail",
  email: "Email",
  portal: "Portal broker",
  application: "Aplicare la job",
  referral: "Recomandare",
  other: "Altul",
} as const;

export type Contact = Base & {
  name: string;
  company: string;
  role: keyof typeof ROLES;
  channel: keyof typeof CHANNELS;
  country: string;
  industry: string;
  sentAt: string;
  message: string;
  refLink: string;
  stage: Stage;
  rate: string;
  nextFollowUp: string;
  url: string;
  notes: string;
  jobId?: string;
};

export const JOB_STATUSES = {
  new: "Nou",
  shortlist: "Shortlist",
  applied: "Aplicat",
  not_interested: "Nu mă interesează",
} as const;
export type JobStatus = keyof typeof JOB_STATUSES;

export type JobMark = Base & { status: JobStatus };

export type Broker = Base & {
  name: string;
  market: string;
  url: string;
  profile: "no" | "created" | "active";
  contactPerson: string;
  lastContact: string;
  notes: string;
};

export type Template = Base & { title: string; channel: string; body: string };

export type Tracker = {
  version: 1;
  contacts: Contact[];
  jobs: JobMark[];
  brokers: Broker[];
  templates: Template[];
};

export const emptyTracker = (): Tracker => ({ version: 1, contacts: [], jobs: [], brokers: [], templates: [] });
