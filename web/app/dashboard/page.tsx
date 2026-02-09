"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

const API = "https://agents.karmapay.xyz";

type Step = "register" | "kyc" | "create-card" | "dashboard";

interface CardInfo {
  card_id: string;
  last4: string;
  name: string;
  deposit_address: string;
  agent_api_key: string;
  limits: { per_txn: number; daily: number; monthly: number };
}

interface Balance {
  available: number;
  balance: number;
  pending_holds: number;
  daily_remaining: number;
  monthly_remaining: number;
  deposit_address: string;
}

async function api<T>(
  path: string,
  opts: { method?: string; key?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.key) headers["Authorization"] = `Bearer ${opts.key}`;
  if (opts.body) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error || `Error ${res.status}`);
  return data as T;
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-karma-purple/50 transition-colors"
      />
    </div>
  );
}

function Button({
  children,
  onClick,
  loading,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary";
}) {
  const base =
    "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-karma-purple hover:bg-karma-pink text-white"
      : "bg-white/5 hover:bg-white/10 border border-white/10 text-white";

  return (
    <button onClick={onClick} disabled={loading} className={`${base} ${styles}`}>
      {loading ? "Loading..." : children}
    </button>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "register", label: "Register" },
    { key: "kyc", label: "KYC" },
    { key: "create-card", label: "Create Card" },
    { key: "dashboard", label: "Dashboard" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              i < currentIdx
                ? "bg-karma-green text-white"
                : i === currentIdx
                ? "bg-karma-purple text-white shadow-[0_0_12px_rgba(133,46,239,0.4)]"
                : "bg-white/[0.04] text-white/25 border border-white/[0.06]"
            }`}
          >
            {i < currentIdx ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            ) : i + 1}
          </div>
          <span
            className={`text-xs hidden sm:inline ${
              i <= currentIdx ? "text-white/70" : "text-white/20"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-px transition-colors duration-300 ${
                i < currentIdx ? "bg-karma-green/50" : "bg-white/[0.06]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Register Step ──────────────────────────────────────────────────────────

function RegisterStep({
  onComplete,
}: {
  onComplete: (key: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ account_id: string; secret_key: string } | null>(null);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ account_id: string; secret_key: string }>("/api/register", {
        method: "POST",
        body: { email },
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="bg-karma-green/10 border border-karma-green/20 rounded-xl p-4">
          <p className="text-karma-green text-sm font-medium mb-2">Account created!</p>
          <p className="text-xs text-white/50">Account ID: {result.account_id}</p>
        </div>
        <div className="bg-black/40 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-2">Your owner key (save it — shown only once):</p>
          <p className="font-mono text-sm text-karma-purple break-all">{result.secret_key}</p>
        </div>
        <Button onClick={() => onComplete(result.secret_key)}>Continue to KYC →</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
      {error && <p className="text-karma-red text-sm">{error}</p>}
      <Button onClick={submit} loading={loading}>Register</Button>
    </div>
  );
}

// ─── KYC Step ───────────────────────────────────────────────────────────────

function KycStep({ ownerKey, onComplete }: { ownerKey: string; onComplete: () => void }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", birthDate: "", nationalId: "",
    countryOfIssue: "US", line1: "", city: "", region: "", postalCode: "", countryCode: "US",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kycUrl, setKycUrl] = useState("");
  const [polling, setPolling] = useState(false);

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ status: string; kyc_url: string | null }>("/api/kyc", {
        method: "POST",
        key: ownerKey,
        body: {
          firstName: form.firstName, lastName: form.lastName, email: form.email,
          birthDate: form.birthDate, nationalId: form.nationalId,
          countryOfIssue: form.countryOfIssue,
          address: {
            line1: form.line1, city: form.city, region: form.region,
            postalCode: form.postalCode, countryCode: form.countryCode,
          },
          ipAddress: "0.0.0.0",
        },
      });
      if (res.status === "approved") {
        onComplete();
      } else if (res.kyc_url) {
        setKycUrl(res.kyc_url);
        setPolling(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "KYC submission failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      try {
        const res = await api<{ status: string }>("/api/kyc/status", { key: ownerKey });
        if (res.status === "approved") {
          setPolling(false);
          onComplete();
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [polling, ownerKey, onComplete]);

  if (kycUrl) {
    return (
      <div className="space-y-4">
        <div className="bg-karma-purple/10 border border-karma-purple/20 rounded-xl p-4">
          <p className="text-karma-pink text-sm font-medium mb-2">Verification required</p>
          <p className="text-xs text-white/50 mb-3">Open this link in your browser to complete identity verification:</p>
          <a href={kycUrl} target="_blank" className="text-sm text-karma-purple hover:text-karma-pink break-all">
            {kycUrl}
          </a>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/40">
          <div className="w-4 h-4 border-2 border-karma-purple border-t-transparent rounded-full animate-spin" />
          Waiting for verification...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="First name" value={form.firstName} onChange={set("firstName")} />
        <Input label="Last name" value={form.lastName} onChange={set("lastName")} />
      </div>
      <Input label="Email" value={form.email} onChange={set("email")} type="email" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Date of birth" value={form.birthDate} onChange={set("birthDate")} placeholder="YYYY-MM-DD" />
        <Input label="National ID / SSN" value={form.nationalId} onChange={set("nationalId")} />
      </div>
      <Input label="Country of issue" value={form.countryOfIssue} onChange={set("countryOfIssue")} placeholder="US" />
      <Input label="Street address" value={form.line1} onChange={set("line1")} />
      <div className="grid grid-cols-3 gap-3">
        <Input label="City" value={form.city} onChange={set("city")} />
        <Input label="State" value={form.region} onChange={set("region")} />
        <Input label="Postal code" value={form.postalCode} onChange={set("postalCode")} />
      </div>
      {error && <p className="text-karma-red text-sm">{error}</p>}
      <Button onClick={submit} loading={loading}>Submit KYC</Button>
    </div>
  );
}

// ─── Create Card Step ───────────────────────────────────────────────────────

function CreateCardStep({
  ownerKey,
  onComplete,
}: {
  ownerKey: string;
  onComplete: (card: CardInfo) => void;
}) {
  const [name, setName] = useState("My Agent Card");
  const [perTxn, setPerTxn] = useState("100");
  const [daily, setDaily] = useState("500");
  const [monthly, setMonthly] = useState("2000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<CardInfo>("/api/cards", {
        method: "POST",
        key: ownerKey,
        body: {
          name,
          per_txn_limit: Number(perTxn) || 100,
          daily_limit: Number(daily) || 500,
          monthly_limit: Number(monthly) || 2000,
        },
      });
      onComplete(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Card creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input label="Card name" value={name} onChange={setName} placeholder="Shopping Agent" />
      <div className="grid grid-cols-3 gap-3">
        <Input label="Per txn limit ($)" value={perTxn} onChange={setPerTxn} type="number" />
        <Input label="Daily limit ($)" value={daily} onChange={setDaily} type="number" />
        <Input label="Monthly limit ($)" value={monthly} onChange={setMonthly} type="number" />
      </div>
      {error && <p className="text-karma-red text-sm">{error}</p>}
      <Button onClick={submit} loading={loading}>Create Card</Button>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

function Dashboard({ card, agentKey }: { card: CardInfo; agentKey: string }) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const bal = await api<Balance>("/api/spend/balance", { key: agentKey });
        setBalance(bal);
      } catch {}
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [agentKey]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Card visual */}
      <div className="relative rounded-2xl bg-gradient-to-br from-karma-purple via-karma-pink/80 to-karma-purple/60 p-[1px]">
        <div className="rounded-2xl bg-gradient-to-br from-[#1a0a2e] via-[#1e1030] to-[#12081d] p-6 card-shine">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Virtual Visa</p>
              <p className="text-lg font-semibold">{card.name}</p>
            </div>
            <img src="/karma-logo.png" alt="Karma" className="w-8 h-8 opacity-60" />
          </div>
          <p className="font-mono text-xl tracking-[0.2em] text-white/80 mb-4">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; {card.last4}</p>
          <div className="flex gap-6 text-xs text-white/40">
            <div>
              <p className="text-[9px] uppercase tracking-wider">Per txn</p>
              <p className="text-white font-medium mt-0.5">${card.limits.per_txn}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider">Daily</p>
              <p className="text-white font-medium mt-0.5">${card.limits.daily}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider">Monthly</p>
              <p className="text-white font-medium mt-0.5">${card.limits.monthly}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Available</p>
          <p className="text-2xl font-bold text-karma-green">
            ${balance?.available.toFixed(2) ?? "—"}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Total Balance</p>
          <p className="text-2xl font-bold">${balance?.balance.toFixed(2) ?? "—"}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Daily Remaining</p>
          <p className="text-lg font-semibold">${balance?.daily_remaining.toFixed(2) ?? "—"}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Monthly Remaining</p>
          <p className="text-lg font-semibold">${balance?.monthly_remaining.toFixed(2) ?? "—"}</p>
        </div>
      </div>

      {/* Deposit address */}
      <div className="glass rounded-xl p-4">
        <p className="text-xs text-white/40 mb-2">Deposit Address (send USDC on Solana)</p>
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm text-karma-green break-all flex-1">
            {card.deposit_address}
          </p>
          <button
            onClick={() => copy(card.deposit_address, "address")}
            className="text-xs text-white/30 hover:text-white/60 shrink-0 cursor-pointer"
          >
            {copied === "address" ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Agent key */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-white/40">Agent API Key</p>
          <button
            onClick={() => setShowKey(!showKey)}
            className="text-xs text-karma-purple hover:text-karma-pink cursor-pointer"
          >
            {showKey ? "Hide" : "Reveal"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm break-all flex-1">
            {showKey ? agentKey : "sk_agent_••••••••••••••••••••"}
          </p>
          {showKey && (
            <button
              onClick={() => copy(agentKey, "key")}
              className="text-xs text-white/30 hover:text-white/60 shrink-0 cursor-pointer"
            >
              {copied === "key" ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        <p className="text-xs text-white/20 mt-2">
          Give this key to your AI agent. It can check balance, verify spend, and get card details.
        </p>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [step, setStep] = useState<Step>("register");
  const [ownerKey, setOwnerKey] = useState("");
  const [card, setCard] = useState<CardInfo | null>(null);
  const [agentKey, setAgentKey] = useState("");

  const stepTitles: Record<Step, string> = {
    register: "Create your account",
    kyc: "Identity verification",
    "create-card": "Create a card for your agent",
    dashboard: "Card Dashboard",
  };

  return (
    <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto bg-grid relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-karma-purple/5 blur-[160px] pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 relative">
        <Link href="/" className="text-xs text-white/25 hover:text-white/50 transition-colors">
          &larr; Back
        </Link>
        <div className="flex items-center gap-4 mt-6 mb-6">
          <img src="/karma-logo.png" alt="Karma" className="w-10 h-10" />
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
      </motion.div>

      <StepIndicator current={step} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold mb-6">{stepTitles[step]}</h2>

            {step === "register" && (
              <RegisterStep
                onComplete={(key) => {
                  setOwnerKey(key);
                  setStep("kyc");
                }}
              />
            )}

            {step === "kyc" && (
              <KycStep ownerKey={ownerKey} onComplete={() => setStep("create-card")} />
            )}

            {step === "create-card" && (
              <CreateCardStep
                ownerKey={ownerKey}
                onComplete={(c) => {
                  setCard(c);
                  setAgentKey(c.agent_api_key);
                  setStep("dashboard");
                }}
              />
            )}

            {step === "dashboard" && card && (
              <Dashboard card={card} agentKey={agentKey} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
