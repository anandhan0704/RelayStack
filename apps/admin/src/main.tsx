import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CircleDollarSign, GitBranch, RadioTower, RefreshCcw, ShieldCheck, UsersRound } from "lucide-react";
import "./styles.css";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3100";

type View = "customers" | "routes" | "compliance" | "billing" | "providers";

type Summary = {
  activeCustomers: number;
  openApprovals: number;
  providerIncidents: number;
  grossMargin: number;
};

type ProviderRoute = {
  id: string;
  name: string;
  channel: string;
  country: string;
  health: string;
  unitCost: number;
};

type Approval = {
  id: string;
  customerName: string;
  type: string;
  status: string;
  createdAt: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  status: string;
  walletBalance: number;
  currency: string;
  createdAt: string;
};

const navItems = [
  { id: "customers", label: "Customers", icon: UsersRound },
  { id: "routes", label: "Routes", icon: GitBranch },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
  { id: "billing", label: "Billing", icon: CircleDollarSign },
  { id: "providers", label: "Providers", icon: RadioTower }
] satisfies { id: View; label: string; icon: typeof UsersRound }[];

function titleCase(value: string) {
  return value
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function App() {
  const [activeView, setActiveView] = useState<View>("customers");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [providers, setProviders] = useState<ProviderRoute[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function requestJson<T>(path: string): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${path}`);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error ?? `Request failed with ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async function loadAdmin() {
    setError(null);

    try {
      const [summaryData, providersData, approvalsData, customersData] = await Promise.all([
        requestJson<Summary>("/v1/admin/summary"),
        requestJson<{ providers: ProviderRoute[] }>("/v1/admin/providers"),
        requestJson<{ approvals: Approval[] }>("/v1/admin/approvals"),
        requestJson<{ customers: Customer[] }>("/v1/admin/customers")
      ]);

      setSummary(summaryData);
      setProviders(providersData.providers);
      setApprovals(approvalsData.approvals);
      setCustomers(customersData.customers);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load admin data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAdmin();
  }, []);

  const routeStats = useMemo(() => {
    const healthy = providers.filter((provider) => provider.health === "healthy").length;
    const degraded = providers.filter((provider) => provider.health === "degraded").length;

    return { healthy, degraded };
  }, [providers]);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">RelayStack Admin</div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button className={activeView === item.id ? "active" : ""} key={item.id} onClick={() => setActiveView(item.id)} type="button">
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations Console</p>
            <h1>{navItems.find((item) => item.id === activeView)?.label}</h1>
          </div>
          <button onClick={loadAdmin} type="button"><RefreshCcw size={18} /> Refresh</button>
        </header>

        {error && <div className="alert error">{error}</div>}
        {isLoading && <div className="alert">Loading admin data...</div>}

        <section className="summary">
          <article><span>Active customers</span><strong>{summary?.activeCustomers ?? "-"}</strong></article>
          <article><span>Open approvals</span><strong>{summary?.openApprovals ?? "-"}</strong></article>
          <article><span>Provider incidents</span><strong>{summary?.providerIncidents ?? "-"}</strong></article>
          <article><span>Gross margin</span><strong>{summary?.grossMargin ?? "-"}%</strong></article>
        </section>

        {activeView === "customers" && (
          <article className="panel">
            <div className="panel-head">
              <h2>Customers</h2>
              <span>{customers.length} accounts</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Wallet</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td><span className={`pill ${customer.status}`}>{titleCase(customer.status)}</span></td>
                      <td>${customer.walletBalance.toFixed(2)} {customer.currency}</td>
                      <td>{formatDate(customer.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        )}

        {(activeView === "routes" || activeView === "providers") && (
          <section className="grid">
            <article className="panel">
              <div className="panel-head">
                <h2>Provider routes</h2>
                <span>{routeStats.healthy} healthy · {routeStats.degraded} degraded</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Channel</th>
                      <th>Country</th>
                      <th>Health</th>
                      <th>Unit cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider.id}>
                        <td>{provider.name}</td>
                        <td>{provider.channel.toUpperCase()}</td>
                        <td>{provider.country}</td>
                        <td><span className={`pill ${provider.health.toLowerCase()}`}>{titleCase(provider.health)}</span></td>
                        <td>${provider.unitCost.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="panel">
              <div className="panel-head">
                <h2>Route policy</h2>
                <span>Read only</span>
              </div>
              <div className="stack">
                <p><strong>India SMS</strong><br />Local SMS Gateway first</p>
                <p><strong>US SMS</strong><br />Twilio 10DLC first</p>
                <p><strong>Voice</strong><br />Bandwidth monitored due degraded health</p>
              </div>
            </article>
          </section>
        )}

        {activeView === "compliance" && (
          <article className="panel">
            <div className="panel-head">
              <h2>Compliance queue</h2>
              <span>{approvals.length} records</span>
            </div>
            <div className="queue">
              {approvals.map((approval) => (
                <div key={approval.id}>
                  <strong>{approval.customerName}</strong>
                  <span>{titleCase(approval.type)} · {formatDate(approval.createdAt)}</span>
                  <em>{titleCase(approval.status)}</em>
                </div>
              ))}
            </div>
          </article>
        )}

        {activeView === "billing" && (
          <section className="grid">
            <article className="panel">
              <div className="panel-head">
                <h2>Wallet exposure</h2>
                <span>All customers</span>
              </div>
              <div className="wallet-total">
                ${customers.reduce((total, customer) => total + customer.walletBalance, 0).toFixed(2)}
              </div>
            </article>
            <article className="panel">
              <div className="panel-head">
                <h2>Billing controls</h2>
                <span>Next</span>
              </div>
              <div className="stack">
                <p><strong>Ledger</strong><br />Wallet transactions are already written on message send.</p>
                <p><strong>Next build</strong><br />Top-ups, invoices, refunds, and route margin reports.</p>
              </div>
            </article>
          </section>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
