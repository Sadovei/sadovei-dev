import { Code } from "@/components/code";

function LifecycleDiagram() {
  const states = [
    { x: 20, label: "Composed", note: "user hits Send" },
    { x: 200, label: "Sending…", note: "shown at once" },
    { x: 380, label: "Sent", note: "server confirmed" },
  ];
  return (
    <figure className="diagram">
      <div className="diagram__scroll" tabIndex={0}>
        <svg viewBox="0 0 720 250" role="img" aria-labelledby="queue-title queue-desc">
          <title id="queue-title">Message lifecycle in an offline-tolerant chat</title>
          <desc id="queue-desc">
            A composed message appears immediately in the conversation with a sending state and joins a queue. The queue
            sends one message at a time, oldest first. On success it is marked sent. On a network failure the queue
            pauses, keeps the order, and resumes when the connection is back. After repeated failures the message is
            marked as not sent, with a retry action.
          </desc>
          <defs>
            <marker id="arrow-q" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10z" className="d-arrowhead" />
            </marker>
          </defs>
          {states.map((state, i) => (
            <g key={state.label}>
              <rect x={state.x} y="30" width="150" height="70" rx="10" className={i === 1 ? "d-box d-accent" : "d-box"} />
              <text x={state.x + 16} y="60" className="d-label">
                {state.label}
              </text>
              <text x={state.x + 16} y="82" className="d-note">
                {state.note}
              </text>
            </g>
          ))}
          <line x1="170" y1="65" x2="200" y2="65" className="d-flow" markerEnd="url(#arrow-q)" />
          <line x1="350" y1="65" x2="380" y2="65" className="d-flow" markerEnd="url(#arrow-q)" />

          <rect x="200" y="150" width="150" height="70" rx="10" className="d-box" />
          <text x="216" y="180" className="d-label">Waiting</text>
          <text x="216" y="202" className="d-note">offline, order kept</text>
          <path d="M240 100 V150" className="d-flow" markerEnd="url(#arrow-q)" />
          <path d="M310 150 V100" className="d-flow" markerEnd="url(#arrow-q)" />
          <text x="150" y="132" className="d-note">network error</text>
          <text x="318" y="132" className="d-note">back online</text>

          <rect x="560" y="150" width="140" height="70" rx="10" className="d-box" />
          <text x="576" y="180" className="d-label">Not sent</text>
          <text x="576" y="202" className="d-note">tap to retry</text>
          <path d="M350 185 H560" className="d-link" markerEnd="url(#arrow-q)" />
          <text x="380" y="176" className="d-note">too many attempts</text>

          <rect x="560" y="30" width="140" height="92" rx="10" className="d-box" />
          <text x="576" y="60" className="d-label">Queue</text>
          <text x="576" y="82" className="d-note">one at a time,</text>
          <text x="576" y="102" className="d-note">oldest first</text>
        </svg>
      </div>
      <figcaption>The message is on screen instantly. The network only decides when it says “sent”.</figcaption>
    </figure>
  );
}

export default async function OfflineQueue() {
  return (
    <>
      <p>
        At SITA I built a real-time communication app for airline operations teams: the people who coordinate a flight
        from the ground. It started as a React Native MVP, then became an Angular PWA inside{" "}
        <strong>SITA Mission Watch</strong>, the flight-tracking platform used by 65+ airlines. Selecting a flight on the
        map opens its conversation, and flight alerts arrive in the same thread.
      </p>
      <p>
        The hardest part wasn&apos;t the chat. It was the network. Airports are full of thick walls, crowded Wi-Fi and
        handovers between Wi-Fi and 4G. Connections don&apos;t just drop; they half-work, stall and come back. A message
        that silently disappears, or arrives after the one written after it, is not a small UX bug when the conversation is
        about a diversion.
      </p>
      <p>
        The answer was an <strong>outbox</strong>: a small queue between the composer and the network. Messages show{" "}
        <em>Sending…</em> straight away and go out in their original order as soon as the connection returns. This note
        is the pattern behind it, written framework-agnostic so it fits React, Angular or plain TypeScript, plus a few
        things I&apos;d add if I built it again.
      </p>

      <h2>Three rules</h2>
      <ol>
        <li>
          <strong>Show it immediately.</strong> The message appears in the thread the moment you press Send, marked{" "}
          <em>Sending…</em>. Waiting for the server before showing anything feels broken on a bad connection.
        </li>
        <li>
          <strong>Keep the order.</strong> Messages go out one at a time, oldest first. If the first one fails, the second
          waits. &quot;Divert to LIS&quot; must never arrive after &quot;Cancel that&quot;.
        </li>
        <li>
          <strong>Never lose anything silently.</strong> A message is either sent, still trying, or clearly marked as not
          sent with a way to retry.
        </li>
      </ol>
      <LifecycleDiagram />

      <h2>The outbox</h2>
      <p>
        The core is a queue that processes one item at a time and stops at the first failure. Stopping is the whole point:
        it&apos;s what keeps the order.
      </p>
      <Code lang="ts" title="outbox.ts">{`
type Status = "sending" | "sent" | "failed";

export type Outgoing = { id: string; roomId: string; body: string; status: Status; attempts: number };

export class Outbox {
  private queue: Outgoing[] = [];
  private running = false;

  constructor(
    private send: (message: Outgoing) => Promise<void>,
    private onChange: (message: Outgoing) => void,
    private maxAttempts = 5,
  ) {}

  add(roomId: string, body: string) {
    const message: Outgoing = { id: crypto.randomUUID(), roomId, body, status: "sending", attempts: 0 };
    this.queue.push(message);
    this.onChange(message); // shown in the thread right away
    void this.flush();
    return message;
  }

  // Sends oldest first and stops at the first failure, so order is always preserved
  async flush() {
    if (this.running) return;
    this.running = true;
    try {
      while (this.queue.length) {
        const message = this.queue[0];
        try {
          await this.send(message);
          message.status = "sent";
          this.queue.shift();
          this.onChange(message);
        } catch {
          message.attempts++;
          if (message.attempts >= this.maxAttempts) {
            message.status = "failed";
            this.queue.shift();
            this.onChange(message);
            continue;
          }
          return; // keep it at the head and wait for the network
        }
      }
    } finally {
      this.running = false;
    }
  }

  retry(message: Outgoing) {
    message.status = "sending";
    message.attempts = 0;
    this.queue.push(message);
    this.onChange(message);
    void this.flush();
  }
}
`}</Code>
      <p>
        Whether a message that finally fails should block the ones after it is a product decision. My advice: let the
        queue move on and mark the failed one clearly, with a retry action. A queue that stays stuck makes the whole app
        look broken.
      </p>

      <h2>When to try again</h2>
      <p>
        <code>navigator.onLine</code> is a hint, not a fact. It says the device has <em>a</em> network, not that the
        server is reachable. Treat three things as reasons to flush again: the browser&apos;s <code>online</code> event,
        the app coming back to the foreground, and a timer with backoff for the cases where neither event fires.
      </p>
      <Code lang="ts" title="retry.ts">{`
export function keepFlushing(outbox: Outbox) {
  let delay = 1_000;
  let timer = 0;

  const flush = async () => {
    window.clearTimeout(timer);
    await outbox.flush();
    // Back off while things keep failing, up to 30 s, then try again anyway
    delay = Math.min(delay * 2, 30_000);
    timer = window.setTimeout(flush, delay);
  };
  const reset = () => {
    delay = 1_000;
    void flush();
  };

  window.addEventListener("online", reset);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") reset();
  });
  void flush();
}
`}</Code>

      <h2>Don&apos;t send twice</h2>
      <p>
        Retries create a classic trap: the request reached the server, but the response got lost on the way back. Retry,
        and you&apos;ve posted the message twice. The fix is an <strong>idempotency key</strong>: give every message its
        own id when it&apos;s created and send it with every attempt, so the server can recognise a repeat.
      </p>
      <p>
        Matrix, the open protocol behind the app, has this built in. Messages are sent with a client-chosen transaction id
        (<code>PUT /rooms/&#123;roomId&#125;/send/m.room.message/&#123;txnId&#125;</code>), and the server treats a
        repeat of the same id as the same message. Reuse the outbox id as the transaction id and retries become safe.
      </p>
      <Code lang="ts" title="send.ts">{`
// The outbox id doubles as Matrix's transaction id, so a retried request can't create a duplicate
const send = (message: Outgoing) =>
  matrix.sendEvent(message.roomId, "m.room.message", { msgtype: "m.text", body: message.body }, message.id);
`}</Code>

      <h2>What the user sees</h2>
      <ul>
        <li>
          <strong>Sending…</strong> in a quieter style next to the message, not a spinner over the whole thread.
        </li>
        <li>
          <strong>A connection banner</strong> only after a few seconds offline. Flashing it on every short drop trains
          people to ignore it.
        </li>
        <li>
          <strong>Not sent · Retry</strong> for the rare message that gives up, right where the message is.
        </li>
        <li>
          Screen readers need the status too: announce &quot;not sent&quot; through a polite live region instead of only
          showing it in red.
        </li>
      </ul>

      <h2>If it has to survive a reload</h2>
      <p>
        The version above lives in memory, which covers the common case: a bad connection while the app is open. If people
        close the app with unsent messages, persist the queue (IndexedDB is the natural place in a PWA) and rebuild it on
        start. Keep the ids, and the idempotency key keeps protecting you from duplicates.
      </p>

      <h2>The takeaway</h2>
      <p>
        Offline support isn&apos;t a feature you add at the end. It&apos;s a decision about where the truth lives. With an
        outbox, the truth is on the device first and on the server soon after, and the interface is honest about the gap
        between the two.
      </p>
    </>
  );
}
