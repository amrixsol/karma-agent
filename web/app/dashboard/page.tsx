"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

const API = "https://agents.karmapay.xyz";

type Step = "register" | "kyc" | "agreements" | "create-card" | "dashboard";

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
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const base =
    "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-karma-purple hover:bg-karma-purple/90 text-white"
      : "bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.08] text-[#111]";

  return (
    <button onClick={onClick} disabled={loading || disabled} className={`${base} ${styles}`}>
      {loading ? "Loading..." : children}
    </button>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "register", label: "Register" },
    { key: "kyc", label: "KYC" },
    { key: "agreements", label: "Terms" },
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
  const [needsOtp, setNeedsOtp] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{
        account_id?: string;
        secret_key?: string;
        requires_otp?: boolean;
        email?: string;
      }>("/api/register", {
        method: "POST",
        body: { email },
      });

      if (res.requires_otp) {
        setNeedsOtp(true);
        setMaskedEmail(res.email || email);
      } else if (res.account_id && res.secret_key) {
        setResult({ account_id: res.account_id, secret_key: res.secret_key });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ account_id: string; secret_key: string }>("/api/register/verify", {
        method: "POST",
        body: { email, code: otpCode },
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="bg-karma-green/8 border border-karma-green/15 rounded-xl p-4">
          <p className="text-karma-green text-sm font-medium mb-2">Account verified!</p>
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

  if (needsOtp) {
    return (
      <div className="space-y-4">
        <div className="bg-black/[0.03] rounded-xl p-4">
          <p className="text-sm text-black/60">Verification code sent to <span className="font-medium text-black/80">{maskedEmail}</span></p>
        </div>
        <Input label="6-digit code" value={otpCode} onChange={setOtpCode} placeholder="123456" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={verifyOtp} loading={loading}>Verify</Button>
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const countries = [
    // Popular markets
    { code: "AE", name: "United Arab Emirates" },
    { code: "GB", name: "United Kingdom" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "ES", name: "Spain" },
    { code: "IT", name: "Italy" },
    { code: "NL", name: "Netherlands" },
    { code: "CH", name: "Switzerland" },
    { code: "SG", name: "Singapore" },
    { code: "AU", name: "Australia" },
    { code: "JP", name: "Japan" },
    { code: "BR", name: "Brazil" },
    // Rest alphabetically
    { code: "AG", name: "Antigua and Barbuda" },
    { code: "AR", name: "Argentina" },
    { code: "AT", name: "Austria" },
    { code: "BS", name: "Bahamas" },
    { code: "BH", name: "Bahrain" },
    { code: "BD", name: "Bangladesh" },
    { code: "BB", name: "Barbados" },
    { code: "BE", name: "Belgium" },
    { code: "BZ", name: "Belize" },
    { code: "BO", name: "Bolivia" },
    { code: "BG", name: "Bulgaria" },
    { code: "CA", name: "Canada" },
    { code: "KY", name: "Cayman Islands" },
    { code: "CL", name: "Chile" },
    { code: "CO", name: "Colombia" },
    { code: "CR", name: "Costa Rica" },
    { code: "CI", name: "Côte d'Ivoire" },
    { code: "HR", name: "Croatia" },
    { code: "CY", name: "Cyprus" },
    { code: "CZ", name: "Czech Republic" },
    { code: "DK", name: "Denmark" },
    { code: "DO", name: "Dominican Republic" },
    { code: "EC", name: "Ecuador" },
    { code: "EG", name: "Egypt" },
    { code: "SV", name: "El Salvador" },
    { code: "EE", name: "Estonia" },
    { code: "FI", name: "Finland" },
    { code: "GH", name: "Ghana" },
    { code: "GR", name: "Greece" },
    { code: "GD", name: "Grenada" },
    { code: "GT", name: "Guatemala" },
    { code: "GY", name: "Guyana" },
    { code: "HN", name: "Honduras" },
    { code: "HK", name: "Hong Kong" },
    { code: "HU", name: "Hungary" },
    { code: "ID", name: "Indonesia" },
    { code: "IE", name: "Ireland" },
    { code: "KE", name: "Kenya" },
    { code: "KR", name: "South Korea" },
    { code: "KW", name: "Kuwait" },
    { code: "LV", name: "Latvia" },
    { code: "LT", name: "Lithuania" },
    { code: "LU", name: "Luxembourg" },
    { code: "MY", name: "Malaysia" },
    { code: "MT", name: "Malta" },
    { code: "MX", name: "Mexico" },
    { code: "MA", name: "Morocco" },
    { code: "NZ", name: "New Zealand" },
    { code: "NG", name: "Nigeria" },
    { code: "NO", name: "Norway" },
    { code: "OM", name: "Oman" },
    { code: "PK", name: "Pakistan" },
    { code: "PA", name: "Panama" },
    { code: "PY", name: "Paraguay" },
    { code: "PE", name: "Peru" },
    { code: "PH", name: "Philippines" },
    { code: "PL", name: "Poland" },
    { code: "PT", name: "Portugal" },
    { code: "QA", name: "Qatar" },
    { code: "RO", name: "Romania" },
    { code: "KN", name: "Saint Kitts and Nevis" },
    { code: "LC", name: "Saint Lucia" },
    { code: "VC", name: "Saint Vincent and the Grenadines" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "SN", name: "Senegal" },
    { code: "SK", name: "Slovakia" },
    { code: "SI", name: "Slovenia" },
    { code: "ZA", name: "South Africa" },
    { code: "SR", name: "Suriname" },
    { code: "SE", name: "Sweden" },
    { code: "TH", name: "Thailand" },
    { code: "TT", name: "Trinidad and Tobago" },
    { code: "TC", name: "Turks and Caicos Islands" },
    { code: "UG", name: "Uganda" },
    { code: "UY", name: "Uruguay" },
    { code: "ZM", name: "Zambia" },
  ];

  const submit = async () => {
    if (!firstName || !lastName) { setError("Name is required."); return; }
    if (!birthDate) { setError("Date of birth is required."); return; }
    if (!country) { setError("Country is required."); return; }
    if (!nationalId) { setError("National ID is required."); return; }
    if (!line1 || !city || !region || !postalCode) { setError("Full address is required."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await api<{ status: string; kyc_url: string | null }>("/api/kyc", {
        method: "POST",
        key: ownerKey,
        body: {
          firstName, lastName, birthDate, countryOfIssue: country, nationalId,
          phoneCountryCode: phoneCode.replace("+", ""),
          phoneNumber: phoneNumber.replace(/\D/g, ""),
          address: { line1, city, region, postalCode, countryCode: country },
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
        <div className="bg-karma-purple/5 border border-karma-purple/10 rounded-xl p-4">
          <p className="text-karma-purple text-sm font-medium mb-2">Verification required</p>
          <p className="text-xs text-black/40 mb-3">Complete identity verification with our card partner:</p>
          <a href={kycUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-karma-purple hover:bg-karma-purple/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Complete Verification
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
    <div className="space-y-5">
      <p className="text-sm text-black/45">Required for card issuance. Sent directly to our card partner.</p>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-black/25 mb-3">Identity</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="First Name" value={firstName} onChange={setFirstName} placeholder="John" />
          <Input label="Last Name" value={lastName} onChange={setLastName} placeholder="Doe" />
        </div>
        <div className="mt-3">
          <Input label="Date of Birth" value={birthDate} onChange={setBirthDate} type="date" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs text-black/40 mb-1.5">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-black/[0.03] border border-black/[0.08] rounded-lg px-3 py-2.5 text-sm text-[#111] focus:outline-none focus:border-karma-purple/50 transition-colors appearance-none"
            >
              <option value="">Select...</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
          <Input label={country === "US" ? "SSN (9 digits)" : "National ID"} value={nationalId} onChange={setNationalId} placeholder="ID number" />
        </div>
        <div className="grid grid-cols-[0.4fr_1fr] gap-3 mt-3">
          <Input label="Code" value={phoneCode} onChange={setPhoneCode} placeholder="+1" />
          <Input label="Phone Number" value={phoneNumber} onChange={setPhoneNumber} placeholder="555 123 4567" />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-black/25 mb-3">Address</p>
        <div className="space-y-3">
          <Input label="Street Address" value={line1} onChange={setLine1} placeholder="123 Main St" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={city} onChange={setCity} placeholder="New York" />
            <Input label="State / Region" value={region} onChange={setRegion} placeholder="NY" />
          </div>
          <Input label="Postal Code" value={postalCode} onChange={setPostalCode} placeholder="10001" />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button onClick={submit} loading={loading}>Continue</Button>
    </div>
  );
}

/* ─── Agreements Step ─── */

function AgreementsStep({
  ownerKey,
  onComplete,
}: {
  ownerKey: string;
  onComplete: () => void;
}) {
  const [esign, setEsign] = useState(false);
  const [cardTerms, setCardTerms] = useState(false);
  const [certify, setCertify] = useState(false);
  const [noSolicitation, setNoSolicitation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allChecked = esign && cardTerms && certify && noSolicitation;

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api<{ accepted: boolean }>("/api/terms/accept", {
        method: "POST",
        key: ownerKey,
      });
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to accept terms");
    } finally {
      setLoading(false);
    }
  };

  const agreements: {
    checked: boolean;
    toggle: () => void;
    label: React.ReactNode;
  }[] = [
    {
      checked: esign,
      toggle: () => setEsign(!esign),
      label: (
        <>
          I accept the{" "}
          <a href="https://karmapay.xyz/esign-consent" target="_blank" rel="noopener noreferrer" className="text-karma-purple hover:text-karma-pink underline">
            E-Sign Consent
          </a>
        </>
      ),
    },
    {
      checked: cardTerms,
      toggle: () => setCardTerms(!cardTerms),
      label: (
        <>
          I accept the{" "}
          <a href="https://www.karmacard.io/card-terms" target="_blank" rel="noopener noreferrer" className="text-karma-purple hover:text-karma-pink underline">
            Karma Card Terms
          </a>
          , and the{" "}
          <a href="https://www.third-national.com/privacypolicy" target="_blank" rel="noopener noreferrer" className="text-karma-purple hover:text-karma-pink underline">
            Issuer Privacy Policy
          </a>
        </>
      ),
    },
    {
      checked: certify,
      toggle: () => setCertify(!certify),
      label: "I certify that the information I have provided is accurate and that I will abide by all the rules and requirements related to my Karma Spend Card.",
    },
    {
      checked: noSolicitation,
      toggle: () => setNoSolicitation(!noSolicitation),
      label: "I acknowledge that applying for the Karma Spend Card does not constitute unauthorized solicitation.",
    },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm text-black/45">Please review and accept the following to continue.</p>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-black/25 mb-3">Agreements</p>
        <div className="space-y-2.5">
          {agreements.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={item.toggle}
              className={`w-full flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                item.checked
                  ? "border-karma-purple/40 bg-karma-purple/[0.04] shadow-[0_0_12px_rgba(133,46,239,0.08)]"
                  : "border-black/[0.06] bg-white hover:border-black/[0.12]"
              }`}
            >
              <div
                className={`mt-px w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 ${
                  item.checked
                    ? "bg-karma-purple shadow-[0_2px_8px_rgba(133,46,239,0.3)]"
                    : "border-2 border-black/20"
                }`}
              >
                {item.checked && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-[15px] text-black/70 leading-snug">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button onClick={submit} loading={loading} disabled={!allChecked}>
        Continue
      </Button>
      {!allChecked && (
        <p className="text-xs text-black/25">Check all four agreements above to continue.</p>
      )}
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

  // Accept owner key from URL hash (e.g. /dashboard#sk_live_...) — detect correct step
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && hash.startsWith("sk_live_")) {
      setOwnerKey(hash);
      history.replaceState(null, "", window.location.pathname);

      // Check KYC + terms status to land on the right step
      (async () => {
        try {
          const kyc = await api<{ status: string }>("/api/kyc/status", { key: hash });
          if (kyc.status === "approved") {
            const terms = await api<{ accepted: boolean }>("/api/terms/status", { key: hash });
            if (terms.accepted) {
              setStep("create-card");
            } else {
              setStep("agreements");
            }
          } else {
            setStep("kyc");
          }
        } catch {
          setStep("kyc");
        }
      })();
    }
  }, []);

  const stepTitles: Record<Step, string> = {
    register: "Create your account",
    kyc: "Identity verification",
    agreements: "Terms & Agreements",
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
                  <KycStep ownerKey={ownerKey} onComplete={() => setStep("agreements")} />
                )}

                {step === "agreements" && (
                  <AgreementsStep
                    ownerKey={ownerKey}
                    onComplete={() => setStep("create-card")}
                  />
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
