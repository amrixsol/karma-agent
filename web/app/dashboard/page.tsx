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

/* ─── Shared Components ─── */

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
      <label className="block text-xs text-black/40 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/[0.03] border border-black/[0.08] rounded-lg px-3 py-2.5 text-sm text-[#111] placeholder:text-black/20 focus:outline-none focus:border-karma-purple/50 transition-colors"
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
      ? "bg-karma-purple hover:bg-karma-purple/90 text-white"
      : "bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.08] text-[#111]";

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
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              i <= currentIdx
                ? "bg-karma-purple text-white"
                : "bg-black/[0.04] text-black/30"
            }`}
          >
            {i < currentIdx ? "✓" : i + 1}
          </div>
          <span
            className={`text-xs hidden sm:inline ${
              i <= currentIdx ? "text-black/60" : "text-black/20"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`w-6 h-px ${
                i < currentIdx ? "bg-karma-purple" : "bg-black/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Register Step ─── */

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
        <div className="bg-karma-green/8 border border-karma-green/15 rounded-xl p-4">
          <p className="text-karma-green text-sm font-medium mb-2">Account created!</p>
          <p className="text-xs text-black/40">Account ID: {result.account_id}</p>
        </div>
        <div className="bg-black/[0.03] rounded-xl p-4">
          <p className="text-xs text-black/40 mb-2">Your owner key (save it — shown only once):</p>
          <p className="font-mono text-sm text-karma-purple break-all">{result.secret_key}</p>
        </div>
        <Button onClick={() => onComplete(result.secret_key)}>Continue to KYC</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button onClick={submit} loading={loading}>Register</Button>
    </div>
  );
}

/* ─── KYC Step ─── */

function KycStep({ ownerKey, onComplete }: { ownerKey: string; onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kycUrl, setKycUrl] = useState("");
  const [polling, setPolling] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ status: string; kyc_url: string | null }>("/api/kyc", {
        method: "POST",
        key: ownerKey,
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
        <div className="bg-karma-purple/5 border border-karma-purple/10 rounded-xl p-4">
          <p className="text-karma-purple text-sm font-medium mb-2">Verification required</p>
          <p className="text-xs text-black/40 mb-3">Complete identity verification (ID + selfie) on the secure page below:</p>
          <a href={kycUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-karma-purple hover:bg-karma-purple/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Open Verification Page
          </a>
        </div>
        <div className="flex items-center gap-3 text-sm text-black/40">
          <div className="w-4 h-4 border-2 border-karma-purple border-t-transparent rounded-full animate-spin" />
          Waiting for verification...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-black/45">
        Click below to open a secure verification page where you&apos;ll upload an ID document and take a selfie. No personal info is stored on our end.
      </p>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button onClick={submit} loading={loading}>Start Verification</Button>
    </div>
  );
}

/* ─── Create Card Step ─── */

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
        <Input label="Per txn ($)" value={perTxn} onChange={setPerTxn} type="number" />
        <Input label="Daily ($)" value={daily} onChange={setDaily} type="number" />
        <Input label="Monthly ($)" value={monthly} onChange={setMonthly} type="number" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button onClick={submit} loading={loading}>Create Card</Button>
    </div>
  );
}

/* ─── Dashboard (lobster.cash style) ─── */

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
    <div className="space-y-4">
      {/* Balance card */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <p className="text-xs text-black/35 mb-1">Your balance</p>
        <p className="text-4xl font-medium tracking-tight mb-4">
          ${balance?.available.toFixed(2) ?? "0.00"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => copy(card.deposit_address, "address")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black/[0.04] hover:bg-black/[0.07] text-sm font-medium text-[#111] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
            {copied === "address" ? "Copied!" : "Fund"}
          </button>
        </div>
      </div>

      {/* Deposit address */}
      <div className="rounded-xl border border-black/[0.06] bg-white p-4">
        <p className="text-xs text-black/35 mb-2">Deposit address (USDC on Solana)</p>
        <p className="font-mono text-sm text-karma-purple break-all">{card.deposit_address}</p>
      </div>

      {/* Card info */}
      <div className="rounded-xl border border-black/[0.06] bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium">{card.name}</p>
            <p className="text-xs text-black/30 font-mono">•••• {card.last4}</p>
          </div>
          <div className="flex gap-4 text-xs text-black/30">
            <span>${card.limits.per_txn}/txn</span>
            <span>${card.limits.daily}/day</span>
            <span>${card.limits.monthly}/mo</span>
          </div>
        </div>
      </div>

      {/* Agent key */}
      <div className="rounded-xl border border-black/[0.06] bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-black/35">Agent API Key</p>
          <button
            onClick={() => setShowKey(!showKey)}
            className="text-xs text-karma-purple hover:text-karma-pink cursor-pointer"
          >
            {showKey ? "Hide" : "Reveal"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm break-all flex-1 text-[#111]">
            {showKey ? agentKey : "sk_agent_••••••••••••••••••••"}
          </p>
          {showKey && (
            <button
              onClick={() => copy(agentKey, "key")}
              className="text-xs text-black/30 hover:text-black/60 shrink-0 cursor-pointer"
            >
              {copied === "key" ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        <p className="text-xs text-black/25 mt-2">
          Give this key to your AI agent. It can check balance, verify spend, and get card details.
        </p>
      </div>

      {/* Empty transactions state */}
      <div className="rounded-xl border border-black/[0.06] bg-white p-8 text-center">
        <p className="text-sm font-medium text-black/50 mb-1">No transactions yet</p>
        <p className="text-xs text-black/25">Your transactions will appear once your agent starts transacting.</p>
      </div>
    </div>
  );
}

/* ─── Main ─── */

export default function DashboardPage() {
  const [step, setStep] = useState<Step>("register");
  const [ownerKey, setOwnerKey] = useState("");
  const [card, setCard] = useState<CardInfo | null>(null);
  const [agentKey, setAgentKey] = useState("");

  const stepTitles: Record<Step, string> = {
    register: "Create your account",
    kyc: "Identity verification",
    "create-card": "Create a card for your agent",
    dashboard: "Dashboard",
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <header className="bg-white border-b border-black/[0.06] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/karma-logo.png" alt="Karma" className="h-7 w-auto" />
            <span className="text-sm font-medium text-black/70">Karma</span>
          </Link>
          {step === "dashboard" && (
            <button className="text-xs text-black/35 hover:text-black/60 transition-colors cursor-pointer">
              Log out
            </button>
          )}
        </div>
      </header>

      <main className="px-6 py-8 max-w-2xl mx-auto">
        {step !== "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <StepIndicator current={step} />
          </motion.div>
        )}

        {step !== "dashboard" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-medium mb-6 text-[#111]">{stepTitles[step]}</h2>

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
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : (
          card && <Dashboard card={card} agentKey={agentKey} />
        )}
      </main>
    </div>
  );
}
