import { createRoot } from "react-dom/client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Activity, BellRing, KeyRound, MessageSquareText, RefreshCcw, Send, Wallet, Webhook } from "lucide-react";
import "./styles.css";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3100";
const demoApiKey = "rs_test_demo_key";

type View = "overview" | "messages" | "otp" | "webhooks" | "keys" | "billing";

type DashboardSummary = {
  metrics: {
    messagesToday: number;
    deliveryRate: number;
    walletBalance: number;
    walletCurrency: string;
    webhookSuccessRate: number;
  };
  apiHealth: {
    uptime: string;
    primarySmsRoute: string;
    emailRoute: string;
    webhookRetries: number;
  };
};

type Message = {
  id: string;
  channel: string;
  from: string;
  to: string;
  body: string;
  status: string;
  provider: string;
  cost: number;
  createdAt: string;
};

type ApiKey = {
  id: string;
  name: string;
  preview: string;
  status: string;
  createdAt: string;
};

type Account = {
  customer: {
    name: string;
    email: string;
    status: string;
  };
  wallet: {
    balance: number;
    currency: string;
  };
  apiKeys: ApiKey[];
};

type SendForm = {
  from: string;
  to: string;
  body: string;
};

const navItems = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "messages", label: "Messages", icon: MessageSquareText },
  { id: "otp", label: "OTP", icon: BellRing },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "keys", label: "API Keys", icon: KeyRound },
  { id: "billing", label: "Billing", icon: Wallet }
] satisfies { id: View; label: string; icon: typeof Activity }[];

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function App() {
  const [activeView, setActiveView] = useState<View>("overview");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [sendForm, setSendForm] = useState<SendForm>({
    from: "RELAY",
    to: "+919876543210",
    body: "Your RelayStack test message is ready."
  });
  const [newKeyName, setNewKeyName] = useState("Production API key");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${path}`, options);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error ?? `Request failed with ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async function loadDashboard() {
    setError(null);

    try {
      const [summaryData, messagesData, accountData] = await Promise.all([
        requestJson<DashboardSummary>("/v1/dashboard/summary"),
        requestJson<{ messages: Message[] }>("/v1/messages"),
        requestJson<Account>("/v1/me")
      ]);

      setSummary(summaryData);
      setMessages(messagesData.messages);
      setAccount(accountData);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setNotice(null);
    setError(null);

    try {
      await requestJson("/v1/messages/sms", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${demoApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(sendForm)
      });

      setNotice("Message accepted and wallet charged.");
      await loadDashboard();
      setActiveView("messages");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send message");
    } finally {
      setIsSending(false);
    }
  }

  async function createKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreatingKey(true);
    setNotice(null);
    setError(null);

    try {
      const apiKey = await requestJson<ApiKey & { key: string }>("/v1/api-keys", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${demoApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newKeyName })
      });

      setRevealedKey(apiKey.key);
      setNotice("API key created. Copy it now; it will not be shown again.");
      await loadDashboard();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create API key");
    } finally {
      setIsCreatingKey(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const metrics = useMemo(() => [
    { label: "Messages", value: String(summary?.metrics.messagesToday ?? "-"), trend: "Total records" },
    { label: "Delivery rate", value: `${summary?.metrics.deliveryRate ?? "-"}%`, trend: "Delivered / total" },
    { label: "Wallet balance", value: `$${(summary?.metrics.walletBalance ?? 0).toFixed(2)}`, trend: summary?.metrics.walletCurrency ?? "USD" },
    { label: "Webhook success", value: `${summary?.metrics.webhookSuccessRate ?? "-"}%`, trend: "Last 24h" }
  ], [summary]);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">RelayStack</div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                className={activeView === item.id ? "active" : ""}
                key={item.id}
                onClick={() => setActiveView(item.id)}
                type="button"
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Customer Dashboard</p>
            <h1>{activeView === "overview" ? "Messaging operations" : navItems.find((item) => item.id === activeView)?.label}</h1>
            <p className="subtle">{account?.customer.name ?? "Demo Commerce"} · {account?.customer.email ?? "Loading account"}</p>
          </div>
          <button className="secondary" onClick={loadDashboard} type="button">
            <RefreshCcw size={18} /> Refresh
          </button>
        </header>

        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}
        {isLoading && <div className="alert">Loading dashboard data...</div>}

        {(activeView === "overview" || activeView === "messages") && (
          <>
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
              <article className="panel">
                <div className="panel-head">
                  <h2>Send SMS</h2>
                  <span>API key protected</span>
                </div>
                <form className="form" onSubmit={sendMessage}>
                  <label>
                    From
                    <input value={sendForm.from} onChange={(event) => setSendForm({ ...sendForm, from: event.target.value })} />
                  </label>
                  <label>
                    To
                    <input value={sendForm.to} onChange={(event) => setSendForm({ ...sendForm, to: event.target.value })} />
                  </label>
                  <label className="span-2">
                    Body
                    <textarea value={sendForm.body} onChange={(event) => setSendForm({ ...sendForm, body: event.target.value })} />
                  </label>
                  <button disabled={isSending} type="submit"><Send size={18} /> {isSending ? "Sending" : "Send message"}</button>
                </form>
              </article>

              <article className="panel">
                <div className="panel-head">
                  <h2>API health</h2>
                  <span>{summary?.apiHealth.uptime ?? "-"}</span>
                </div>
                <div className="stack">
                  <p><strong>Primary SMS route</strong><br />{summary?.apiHealth.primarySmsRoute ?? "-"}</p>
                  <p><strong>Email route</strong><br />{summary?.apiHealth.emailRoute ?? "-"}</p>
                  <p><strong>Webhook retries</strong><br />{summary?.apiHealth.webhookRetries ?? 0} pending retries</p>
                </div>
              </article>
            </section>
          </>
        )}

        {(activeView === "overview" || activeView === "messages" || activeView === "otp") && (
          <article className="panel table-panel">
            <div className="panel-head">
              <h2>Recent messages</h2>
              <span>{messages.length} records</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Message</th>
                    <th>Channel</th>
                    <th>Destination</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {messages
                    .filter((message) => activeView !== "otp" || message.channel === "otp")
                    .map((message) => (
                      <tr key={message.id}>
                        <td className="mono">{message.id.slice(0, 8)}</td>
                        <td>{message.channel.toUpperCase()}</td>
                        <td>{message.to}</td>
                        <td>{message.provider}</td>
                        <td><span className={`status ${message.status.toLowerCase()}`}>{titleCase(message.status)}</span></td>
                        <td>${message.cost.toFixed(4)}</td>
                        <td>{formatDate(message.createdAt)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </article>
        )}

        {activeView === "keys" && (
          <section className="grid">
            <article className="panel">
              <div className="panel-head">
                <h2>Create API key</h2>
                <span>Test mode</span>
              </div>
              <form className="form single" onSubmit={createKey}>
                <label>
                  Key name
                  <input value={newKeyName} onChange={(event) => setNewKeyName(event.target.value)} />
                </label>
                <button disabled={isCreatingKey} type="submit"><KeyRound size={18} /> {isCreatingKey ? "Creating" : "Create key"}</button>
              </form>
              {revealedKey && <pre className="secret">{revealedKey}</pre>}
            </article>

            <article className="panel">
              <div className="panel-head">
                <h2>Existing keys</h2>
                <span>{account?.apiKeys.length ?? 0}</span>
              </div>
              <div className="list">
                {account?.apiKeys.map((apiKey) => (
                  <div key={apiKey.id}>
                    <strong>{apiKey.name}</strong>
                    <span>{apiKey.preview}</span>
                    <em>{titleCase(apiKey.status)}</em>
                  </div>
                ))}
              </div>
            </article>
          </section>
        )}

        {activeView === "billing" && (
          <section className="grid">
            <article className="panel">
              <div className="panel-head">
                <h2>Wallet</h2>
                <span>{account?.wallet.currency ?? "USD"}</span>
              </div>
              <div className="wallet-total">${(account?.wallet.balance ?? 0).toFixed(2)}</div>
            </article>
            <article className="panel">
              <div className="panel-head">
                <h2>Pricing preview</h2>
                <span>Current routes</span>
              </div>
              <div className="stack">
                <p><strong>India SMS</strong><br />$0.0042 per accepted message</p>
                <p><strong>US SMS</strong><br />$0.0120 per accepted message</p>
                <p><strong>Fallback SMS</strong><br />$0.0180 per accepted message</p>
              </div>
            </article>
          </section>
        )}

        {activeView === "webhooks" && (
          <section className="grid">
            <article className="panel">
              <div className="panel-head">
                <h2>Delivery webhooks</h2>
                <span>Configured later</span>
              </div>
              <div className="empty">Webhook endpoints and retry history will attach to the message status pipeline next.</div>
            </article>
            <article className="panel">
              <div className="panel-head">
                <h2>Retry policy</h2>
                <span>Default</span>
              </div>
              <div className="stack">
                <p><strong>Attempts</strong><br />5 retries</p>
                <p><strong>Backoff</strong><br />Exponential</p>
                <p><strong>Signing</strong><br />HMAC planned</p>
              </div>
            </article>
          </section>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
