import { createRoot } from "react-dom/client";
import { Activity, BellRing, KeyRound, MessageSquareText, Send, Wallet, Webhook } from "lucide-react";
import "./styles.css";

const metrics = [
  { label: "Messages today", value: "18,420", trend: "+12.4%" },
  { label: "Delivery rate", value: "98.7%", trend: "+0.8%" },
  { label: "Wallet balance", value: "$2,840.50", trend: "14 days" },
  { label: "Webhook success", value: "99.2%", trend: "-0.1%" }
];

const logs = [
  { id: "msg_01HZ", channel: "SMS", to: "+91 98765 43210", status: "Delivered", cost: "$0.012" },
  { id: "msg_01JA", channel: "Email", to: "buyer@example.com", status: "Accepted", cost: "$0.001" },
  { id: "msg_01JB", channel: "OTP", to: "+1 415 555 0199", status: "Queued", cost: "$0.018" },
  { id: "msg_01JC", channel: "SMS", to: "+971 50 555 0101", status: "Failed", cost: "$0.000" }
];

function App() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">RelayStack</div>
        <nav>
          <a className="active"><Activity size={18} /> Overview</a>
          <a><MessageSquareText size={18} /> Messages</a>
          <a><BellRing size={18} /> OTP</a>
          <a><Webhook size={18} /> Webhooks</a>
          <a><KeyRound size={18} /> API Keys</a>
          <a><Wallet size={18} /> Billing</a>
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Customer Dashboard</p>
            <h1>Messaging operations</h1>
          </div>
          <button><Send size={18} /> Send test</button>
        </header>

        <section className="metrics">
          {metrics.map((metric) => (
            <article className="metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.trend}</small>
            </article>
          ))}
        </section>

        <section className="grid">
          <article className="panel large">
            <div className="panel-head">
              <h2>Recent messages</h2>
              <span>Live</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Channel</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.channel}</td>
                    <td>{log.to}</td>
                    <td><span className={`status ${log.status.toLowerCase()}`}>{log.status}</span></td>
                    <td>{log.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>API health</h2>
              <span>99.99%</span>
            </div>
            <div className="stack">
              <p><strong>Primary SMS route</strong><br />Twilio US 10DLC</p>
              <p><strong>Email route</strong><br />SendGrid transactional</p>
              <p><strong>Webhook retries</strong><br />3 pending retries</p>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

