import { createRoot } from "react-dom/client";
import { BadgeCheck, CircleDollarSign, GitBranch, RadioTower, ShieldCheck, UsersRound } from "lucide-react";
import "./styles.css";

const providers = [
  { name: "Twilio", channel: "SMS", health: "Healthy", cost: "$0.0120" },
  { name: "Bandwidth", channel: "Voice", health: "Degraded", cost: "$0.0068" },
  { name: "SendGrid", channel: "Email", health: "Healthy", cost: "$0.0010" },
  { name: "Local SMS Gateway", channel: "SMS", health: "Healthy", cost: "$0.0042" }
];

const approvals = [
  { customer: "NovaCart", type: "Sender ID", status: "Pending" },
  { customer: "Finovo", type: "Template", status: "Review" },
  { customer: "MediLink", type: "KYC", status: "Approved" }
];

function App() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">RelayStack Admin</div>
        <nav>
          <a className="active"><UsersRound size={18} /> Customers</a>
          <a><GitBranch size={18} /> Routes</a>
          <a><ShieldCheck size={18} /> Compliance</a>
          <a><CircleDollarSign size={18} /> Billing</a>
          <a><RadioTower size={18} /> Providers</a>
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations Console</p>
            <h1>Platform control plane</h1>
          </div>
          <button><BadgeCheck size={18} /> Review queue</button>
        </header>

        <section className="summary">
          <article><span>Active customers</span><strong>124</strong></article>
          <article><span>Open approvals</span><strong>18</strong></article>
          <article><span>Provider incidents</span><strong>1</strong></article>
          <article><span>Gross margin</span><strong>42.8%</strong></article>
        </section>

        <section className="grid">
          <article className="panel">
            <div className="panel-head">
              <h2>Provider routes</h2>
              <span>Cost + health</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Channel</th>
                  <th>Health</th>
                  <th>Unit cost</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.name}>
                    <td>{provider.name}</td>
                    <td>{provider.channel}</td>
                    <td><span className={`pill ${provider.health.toLowerCase()}`}>{provider.health}</span></td>
                    <td>{provider.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Compliance queue</h2>
              <span>Today</span>
            </div>
            <div className="queue">
              {approvals.map((approval) => (
                <div key={`${approval.customer}-${approval.type}`}>
                  <strong>{approval.customer}</strong>
                  <span>{approval.type}</span>
                  <em>{approval.status}</em>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

