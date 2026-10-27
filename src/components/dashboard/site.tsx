"use client";

import { useState } from "react";
import styles from "./dashboard.module.css";
import { daysAgo, formatDate } from "./format";
import { contactVisits, eventGroups, eventTotal, NO_REFERRER, SCHEMES, sizeLabel, yTicks } from "./site-data";
import { STAGES, type Contact, type SiteStats } from "./types";

type RunState = "idle" | "running" | "started" | "error";

type Props = {
  stats: SiteStats | null;
  contacts: Contact[];
  onOpenContact: (contact: Contact) => void;
  onRun: () => void;
  runState: RunState;
};

const GOATCOUNTER = "https://sadovei.goatcounter.com/";

function RunButton({ onRun, runState }: Pick<Props, "onRun" | "runState">) {
  return (
    <button type="button" className={styles.btnSmall} onClick={onRun} disabled={runState === "running"}>
      {runState === "running" ? "Pornesc…" : runState === "started" ? "Pornit, apasă „Reîncarcă” în ~1 min" : runState === "error" ? "Eroare, încearcă iar" : "Actualizează acum"}
    </button>
  );
}

function Setup({ onRun, runState }: Pick<Props, "onRun" | "runState">) {
  return (
    <section className={styles.card}>
      <h2>Conectează GoatCounter (o singură dată)</h2>
      <ol className={styles.steps}>
        <li>
          În <a href={GOATCOUNTER} target="_blank" rel="noopener noreferrer">GoatCounter</a>: numele tău (sus, în dreapta) → <strong>API</strong> → <strong>New API key</strong>. Bifezi doar{" "}
          <strong>Read statistics</strong> și copiezi cheia.
        </li>
        <li>
          În terminal, pe Mac-ul personal: <code>pbpaste | GH_TOKEN=$(gh auth token --user Sadovei) gh secret set GOATCOUNTER_TOKEN --repo Sadovei/job-radar</code>. Cheia ajunge direct în GitHub Secrets, fără să apară pe ecran.
        </li>
        <li>
          Apeși <RunButton onRun={onRun} runState={runState} />, apoi „Reîncarcă” după un minut.
        </li>
      </ol>
    </section>
  );
}

function DailyChart({ daily }: { daily: SiteStats["daily"] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...daily.map((d) => d.visits));
  const ticks = yTicks(max);
  const top = ticks[2];
  const point = active === null ? null : daily[active];
  const edge = active === null ? 0 : active / Math.max(1, daily.length - 1);
  const shift = edge < 0.15 ? "0%" : edge > 0.85 ? "-100%" : "-50%";

  if (!max) return <p className={styles.muted}>Nicio vizită în această perioadă.</p>;
  return (
    <>
      <div className={styles.chart}>
        <div className={styles.yAxis} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} style={{ bottom: `${(t / top) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
        <div className={styles.plot} onPointerLeave={() => setActive(null)}>
          {ticks.slice(1).map((t) => (
            <span key={t} className={styles.gridline} style={{ bottom: `${(t / top) * 100}%` }} aria-hidden="true" />
          ))}
          {daily.map((d, i) => (
            <div
              key={d.day}
              className={styles.col}
              tabIndex={0}
              role="img"
              aria-label={`${formatDate(d.day)}: ${d.visits} vizite`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              {d.visits > 0 && <span className={styles.colBar} style={{ height: `${(d.visits / top) * 100}%` }} />}
            </div>
          ))}
          {point && (
            <div className={styles.tip} style={{ left: `${((active! + 0.5) / daily.length) * 100}%`, transform: `translate(${shift}, -100%)` }} aria-hidden="true">
              <strong>{point.visits}</strong> <span className={styles.muted}>vizite · {formatDate(point.day)}</span>
            </div>
          )}
        </div>
        <div className={styles.xAxis} aria-hidden="true">
          <span>{formatDate(daily[0].day)}</span>
          <span>{formatDate(daily[Math.floor(daily.length / 2)].day)}</span>
          <span>{formatDate(daily.at(-1)!.day)}</span>
        </div>
      </div>
      <details className={styles.tableView}>
        <summary>Vezi ca tabel</summary>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ziua</th>
              <th>Vizite</th>
            </tr>
          </thead>
          <tbody>
            {daily
              .filter((d) => d.visits)
              .toReversed()
              .map((d) => (
                <tr key={d.day}>
                  <td>{formatDate(d.day)}</td>
                  <td className={styles.num}>{d.visits}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </>
  );
}

// A table row value with a thin bar behind it, scaled to the largest value in the table
function Meter({ value, max }: { value: number; max: number }) {
  return (
    <>
      <span className={styles.num}>{value}</span>
      <span className={styles.meter} style={{ width: `${Math.max(2, (value / Math.max(1, max)) * 100)}%` }} aria-hidden="true" />
    </>
  );
}

export function Site({ stats, contacts, onOpenContact, onRun, runState }: Props) {
  if (!stats) {
    return (
      <>
        <h1 className={styles.h1}>Site</h1>
        <p className={styles.sub}>Statisticile de pe sadovei.dev, din GoatCounter. Încă nu sunt date.</p>
        <Setup onRun={onRun} runState={runState} />
      </>
    );
  }

  const live = contacts.filter((c) => !c.deleted && c.stage !== "to_contact");
  const visited = live
    .map((c) => ({ contact: c, seen: contactVisits(c, stats) }))
    .filter((x): x is { contact: Contact; seen: NonNullable<typeof x.seen> } => x.seen !== null)
    .sort((a, b) => b.seen.lastDay.localeCompare(a.seen.lastDay));
  const matchedRefs = new Set(visited.flatMap((v) => v.seen.refs));
  const withLink = live.filter((c) => c.refLink).length;
  const otherCampaigns = stats.referrers.filter((r) => r.scheme === "c" && !matchedRefs.has(r.name));
  const refVisits = stats.referrers.reduce((sum, r) => sum + r.visits, 0);
  const noRefShare = refVisits ? Math.round((stats.totals.noReferrer / refVisits) * 100) : 0;
  const maxRef = Math.max(1, ...stats.referrers.map((r) => r.visits));
  const maxPage = Math.max(1, ...stats.pages.map((p) => p.visits));
  const groups = eventGroups(stats.events);

  return (
    <>
      <h1 className={styles.h1}>Site</h1>
      <p className={styles.sub}>
        sadovei.dev în ultimele {stats.days} de zile · date din GoatCounter, verificate la 3 ore · ultima schimbare {daysAgo(stats.generatedAt)} (
        {new Date(stats.generatedAt).toLocaleString("ro-RO")})
      </p>
      <p className={styles.links} style={{ marginBottom: 20 }}>
        <RunButton onRun={onRun} runState={runState} />
        <a className={styles.btnSmall} href={GOATCOUNTER} target="_blank" rel="noopener noreferrer">
          Deschide GoatCounter
        </a>
      </p>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <strong>{stats.totals.visits}</strong>
          <span>vizite pe pagini</span>
        </div>
        <div className={styles.kpi}>
          <strong>
            {visited.length}
            <small className={styles.muted}> / {withLink}</small>
          </strong>
          <span>contacte care ți-au deschis linkul ?ref</span>
        </div>
        <div className={styles.kpi}>
          <strong>{eventTotal(stats.events, "download-cv")}</strong>
          <span>descărcări CV</span>
        </div>
        <div className={styles.kpi}>
          <strong>{eventTotal(stats.events, "book-call")}</strong>
          <span>click-uri pe „Book a call”</span>
        </div>
        <div className={styles.kpi}>
          <strong>{noRefShare}%</strong>
          <span>vizite fără sursă (vezi jos)</span>
        </div>
      </div>

      <section className={styles.card} style={{ marginBottom: 16 }}>
        <h2>Vizite pe zi</h2>
        <DailyChart daily={stats.daily} />
      </section>

      <section className={styles.card} style={{ marginBottom: 16 }}>
        <h2>Cine ți-a deschis site-ul din mesaje</h2>
        {visited.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Trimis</th>
                  <th>Prima vizită</th>
                  <th>Ultima</th>
                  <th>Vizite</th>
                  <th>Etapă</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visited.map(({ contact: c, seen }) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      <div className={styles.muted}>
                        {c.company} · ?ref={seen.refs.join(", ")}
                      </div>
                    </td>
                    <td className={styles.nowrap}>{formatDate(c.sentAt)}</td>
                    <td className={styles.nowrap}>{formatDate(seen.firstDay)}</td>
                    <td className={styles.nowrap}>{formatDate(seen.lastDay)}</td>
                    <td className={styles.num}>{seen.visits}</td>
                    <td>{STAGES[c.stage]}</td>
                    <td>
                      <button type="button" className={styles.btnSmall} onClick={() => onOpenContact(c)}>
                        Deschide
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={`${styles.muted} ${styles.small}`}>
            Încă nimeni dintre cei {withLink} cărora le-ai trimis un link ?ref. Vizitele de dinaintea mesajului nu se pun (de obicei ești tu, testând linkul).
          </p>
        )}
        {otherCampaigns.length > 0 && (
          <p className={`${styles.muted} ${styles.small}`} style={{ marginTop: 12 }}>
            Alte linkuri ?ref deschise:{" "}
            {otherCampaigns.map((r, i) => (
              <span key={r.name}>
                {i > 0 && " · "}
                <strong className={styles.ink}>{r.name}</strong> {r.visits} ({formatDate(r.lastDay)})
              </span>
            ))}
          </p>
        )}
      </section>

      <div className={styles.grid2}>
        <section className={styles.card}>
          <h2>De unde vin vizitatorii</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sursa</th>
                <th>Vizite</th>
                <th>Ultima</th>
              </tr>
            </thead>
            <tbody>
              {stats.referrers.slice(0, 15).map((r) => (
                <tr key={`${r.scheme}|${r.name}`}>
                  <td className={styles.break}>
                    {r.name || NO_REFERRER}
                    {r.name && <div className={`${styles.muted} ${styles.small}`}>{SCHEMES[r.scheme] ?? r.scheme}</div>}
                  </td>
                  <td className={styles.meterCell}>
                    <Meter value={r.visits} max={maxRef} />
                  </td>
                  <td className={styles.nowrap}>{formatDate(r.lastDay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.card}>
          <h2>Ce pagini se citesc</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pagina</th>
                <th>Vizite</th>
              </tr>
            </thead>
            <tbody>
              {stats.pages.slice(0, 15).map((p) => (
                <tr key={p.path}>
                  <td className={styles.break}>
                    {p.title || p.path}
                    {p.title && <div className={`${styles.muted} ${styles.small}`}>{p.path}</div>}
                  </td>
                  <td className={styles.meterCell}>
                    <Meter value={p.visits} max={maxPage} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.card}>
          <h2>Ce au apăsat</h2>
          {groups.length ? (
            <ul className={styles.list}>
              {groups.map((g) => (
                <li key={g.label}>
                  <strong className={styles.num}>{g.total}</strong> {g.label}
                  <div className={`${styles.muted} ${styles.small}`}>{g.items.map((e) => `${e.name} (${e.count})`).join(" · ")}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>Niciun click urmărit încă.</p>
          )}
        </section>

        <section className={styles.card}>
          <h2>Țări și dispozitive</h2>
          <table className={styles.table}>
            <tbody>
              {stats.locations.slice(0, 8).map((l) => (
                <tr key={l.name}>
                  <td>{l.name}</td>
                  <td className={styles.numCol}>{l.visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className={styles.table} style={{ marginTop: 12 }}>
            <tbody>
              {stats.sizes.map((s) => (
                <tr key={s.name}>
                  <td>{sizeLabel(s.name)}</td>
                  <td className={styles.numCol}>{s.visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.card}>
          <h2>De ce apar vizite „fără sursă”?</h2>
          <p className={`${styles.muted} ${styles.small}`}>
            Browserul nu a trimis de unde vine vizitatorul. E normal la vizitele directe și la linkurile din aplicații (LinkedIn pe telefon, Gmail, Mail), din PDF-ul CV-ului sau de la
            site-uri care ascund sursa. Ca să scadă:
          </p>
          <ul className={styles.list}>
            <li>
              Pune <code>?ref=</code> pe fiecare link către site: LinkedIn (<code>sadovei.dev/?ref=linkedin</code>), GitHub (<code>?ref=github</code>), CV (<code>?ref=cv</code>). Semnătura
              are deja <code>?ref=email</code>.
            </li>
            <li>
              Ca să nu-ți numeri propriile vizite, deschide o dată{" "}
              <a href="https://sadovei.dev/#toggle-goatcounter" target="_blank" rel="noopener noreferrer">
                sadovei.dev/#toggle-goatcounter
              </a>{" "}
              în fiecare browser personal (telefon, Mac) și confirmi.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
