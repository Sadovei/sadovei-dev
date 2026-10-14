import { Code } from "@/components/code";

function PipelineDiagram() {
  const steps = [
    { label: "One click", note: "or a schedule" },
    { label: "Job queue", note: "one job per report" },
    { label: "Headless app", note: "Puppeteer, real UI" },
    { label: "Email", note: "to the broker" },
  ];
  return (
    <figure className="diagram">
      <div className="diagram__scroll" tabIndex={0}>
        <svg viewBox="0 0 720 200" role="img" aria-labelledby="pipe-title pipe-desc">
          <title id="pipe-title">Report pipeline that reuses the application itself</title>
          <desc id="pipe-desc">
            A click or a schedule creates a job. A worker opens the real application in a headless browser with the
            user&apos;s saved configuration, waits until the app says it is ready, extracts the result and emails it.
          </desc>
          <defs>
            <marker id="arrow-p" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10z" className="d-arrowhead" />
            </marker>
          </defs>
          {steps.map((step, i) => {
            const x = 20 + i * 178;
            return (
              <g key={step.label}>
                <rect x={x} y="40" width="150" height="76" rx="10" className={i === 2 ? "d-box d-accent" : "d-box"} />
                <text x={x + 16} y="72" className="d-label">
                  {step.label}
                </text>
                <text x={x + 16} y="94" className="d-note">
                  {step.note}
                </text>
                {i < steps.length - 1 && <line x1={x + 150} y1="78" x2={x + 178} y2="78" className="d-flow" markerEnd="url(#arrow-p)" />}
              </g>
            );
          })}
          <text x="376" y="150" className="d-note">saved view · same calculations · same formatting</text>
          <text x="376" y="172" className="d-note">waits for an explicit “ready” signal, never a timeout</text>
        </svg>
      </div>
      <figcaption>Instead of rebuilding the report, the server runs the app the broker already trusts.</figcaption>
    </figure>
  );
}

export default async function HeadlessReports() {
  return (
    <>
      <p>
        At RBC Capital Markets I worked on RiskHub, an internal risk platform where people keep dozens of tables and
        charts open at once. One request kept coming back from the brokers: they configured a view in the platform, and
        then, every day, spent four or five minutes turning it into an email for the people who needed it.
      </p>
      <p>
        Four or five minutes doesn&apos;t sound like much. Done every day by dozens of people, it&apos;s hours a week of
        skilled time spent copying numbers around, plus the risk of copying the wrong ones.
      </p>
      <p>
        The obvious fix was a separate reporting service. I did something simpler:{" "}
        <strong>a headless Node.js service that runs the application itself</strong> on the server, with Puppeteer,
        replays the broker&apos;s configuration, and sends the result. For the broker, the whole task became one click.
      </p>
      <p>
        I can&apos;t share anything specific about the bank&apos;s platform, so this note is the general pattern, with
        code written from scratch.
      </p>

      <h2>Why run the app instead of rebuilding the report</h2>
      <ul>
        <li>
          <strong>One source of truth.</strong> The numbers in the email come from the same code the broker sees on screen:
          same calculations, same filters, same formatting. A second implementation will drift from the first, usually in
          the places that matter.
        </li>
        <li>
          <strong>Every new view is supported for free.</strong> If someone can configure it in the UI, the service can
          send it.
        </li>
        <li>
          <strong>It ships faster.</strong> Most of the work is plumbing around a browser, not re-implementing business
          logic.
        </li>
      </ul>
      <p>
        The trade-off is cost and fragility. A headless browser is heavier than a database query, and a careless script
        breaks every time the UI changes. Both are manageable if you design for them.
      </p>
      <PipelineDiagram />

      <h2>Wait for the app, not for time</h2>
      <p>
        The most common reason these scripts are flaky is <code>waitForTimeout(5000)</code>: wait a bit and hope the data
        is there. The fix is to let the application announce when it&apos;s ready. A tiny flag set by the app after its
        data and charts have rendered is far more reliable than any selector or timer.
      </p>
      <Code title="app side">{`
// In the app: flip a flag once the view has data and the charts have rendered
useEffect(() => {
  if (status === "ready") window.__REPORT_READY__ = true;
}, [status]);
`}</Code>
      <Code lang="ts" title="render-report.ts">{`
import puppeteer, { type Browser } from "puppeteer";

let browser: Browser | undefined;

// Reuse one browser and open a fresh, isolated context per report
async function getBrowser() {
  browser ??= await puppeteer.launch({ headless: true });
  return browser;
}

export async function renderReport(viewId: string, token: string) {
  const context = await (await getBrowser()).createBrowserContext();
  const page = await context.newPage();
  try {
    await page.setViewport({ width: 1440, height: 900 });
    await page.setExtraHTTPHeaders({ Authorization: \`Bearer \${token}\` });
    await page.goto(\`\${process.env.APP_URL}/views/\${viewId}?mode=report\`, { waitUntil: "networkidle0", timeout: 60_000 });

    // The app tells us when it's done; no guessing
    await page.waitForFunction(() => window.__REPORT_READY__ === true, { timeout: 60_000 });

    // Pull structured data from the page for the email body, and a PDF for the attachment
    const rows = await page.$$eval("[data-report-row]", (els) => els.map((el) => el.textContent?.trim() ?? ""));
    const pdf = await page.pdf({ format: "A4", landscape: true, printBackground: true });
    return { rows, pdf };
  } finally {
    await context.close();
  }
}
`}</Code>
      <p>
        A <code>?mode=report</code> flag is worth adding to the app: hide navigation and tooltips, disable animations,
        and render in a layout that prints well. It also makes it obvious to whoever changes the UI that this view has a
        second consumer.
      </p>

      <h2>One click, then a queue</h2>
      <p>
        The button in the app doesn&apos;t wait for the report. It creates a job and returns at once; a worker picks it up,
        renders the view and sends the email. That keeps the click instant and lets you control how many browsers run at
        the same time.
      </p>
      <Code lang="ts" title="routes.ts">{`
app.post("/reports/:viewId/send", requireUser, async (req, res) => {
  await queue.add("send-report", { viewId: req.params.viewId, userId: req.user.id });
  res.status(202).json({ status: "queued" });
});

worker.process("send-report", { concurrency: 2 }, async ({ viewId, userId }) => {
  const token = await issueShortLivedToken(userId); // the report sees exactly what the user is allowed to see
  const { rows, pdf } = await renderReport(viewId, token);
  await mailer.send({ to: await emailOf(userId), subject: subjectFor(viewId), text: rows.join("\\n"), attachments: [{ filename: "report.pdf", content: pdf }] });
});
`}</Code>

      <h2>Things that matter in a bank (and everywhere else)</h2>
      <ul>
        <li>
          <strong>Permissions.</strong> Render as the user, with a short-lived token, never with a shared super-account.
          The email must contain exactly what that person can already see.
        </li>
        <li>
          <strong>Isolation.</strong> A fresh browser context per job, so no cookies or state leak between users.
        </li>
        <li>
          <strong>Limits.</strong> Cap concurrency and give every step a timeout. One stuck page shouldn&apos;t block the
          queue.
        </li>
        <li>
          <strong>Observability.</strong> Log every job with its duration and outcome, and keep a screenshot when one
          fails. &quot;The email didn&apos;t arrive&quot; is easy to debug when you can see what the browser saw.
        </li>
        <li>
          <strong>Stable hooks.</strong> Read data through <code>data-*</code> attributes made for this purpose, not
          through CSS classes that a redesign will rename.
        </li>
      </ul>

      <h2>When not to do this</h2>
      <p>
        If the report is simple and the data is already available through an API, query it directly; a browser is
        overkill. This pattern shines when the value is in the front end: complex views, client-side calculations, charts
        and formatting that people already trust.
      </p>

      <h2>The takeaway</h2>
      <p>
        The best automation often isn&apos;t a new system. It&apos;s the existing one, run by a machine, exactly the way a
        person would use it.
      </p>
    </>
  );
}
