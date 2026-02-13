"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.6, delay, ease: [0, 0, 0.2, 1] as const },
});

const DEMO_MESSAGES = [
  {
    q: "Buy 3 months of Vercel Pro for the staging project",
    a: "Done. Paid $60.00 with card ****4821. Invoice from Vercel confirmed. Remaining daily limit: $440.",
  },
  {
    q: "Pay the Anthropic API invoice that came in today",
    a: "Found invoice #ANT-8842 for $312.50. Payment submitted with card ****4821 and confirmed. Receipt saved.",
  },
  {
    q: "Can I afford to buy a .com domain on Namecheap?",
    a: "Checked: $9.98 + $0.16 fees = $10.14 total. You have $427.50 available. Yes, you can afford it.",
  },
];

function ChatDemo() {
  const [active, setActive] = useState(0);
  const msg = DEMO_MESSAGES[active];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Window chrome */}
      <div className="rounded-t-2xl bg-white/[0.04] border border-white/[0.08] border-b-0 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        <span className="flex-1 text-center text-xs text-white/25 font-mono">karma-agent</span>
      </div>

      {/* Chat body */}
      <div className="rounded-b-2xl bg-white/[0.02] border border-white/[0.08] border-t-white/[0.04] p-5 min-h-[180px] md:min-h-[200px]">
        <div className="flex justify-end mb-4">
          <div className="bg-karma-purple/20 border border-karma-purple/20 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
            <p className="text-sm text-white/90">{msg.q}</p>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%]">
            <p className="text-sm text-white/70">{msg.a}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-3 justify-center">
        {DEMO_MESSAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === active ? "w-6 bg-karma-purple" : "w-1.5 bg-white/15 hover:bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CardMockup() {
  return (
    <div className="relative w-full max-w-[380px] aspect-[1.586/1]">
      {/* Glow behind card */}
      <div className="absolute inset-0 bg-gradient-to-br from-karma-purple/30 to-karma-pink/20 rounded-3xl blur-[40px] scale-110" />

      {/* Card */}
      <div className="relative w-full h-full bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "24px 24px"
        }} />

        {/* Top row */}
        <div className="flex justify-between items-start relative z-10">
          <div>
            <img src="/karma-logo.png" alt="Karma" className="h-7 w-auto opacity-80" />
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Agent Card</p>
            <p className="text-xs text-karma-green font-mono mt-0.5">Active</p>
          </div>
        </div>

        {/* Card number */}
        <div className="relative z-10">
          <p className="font-mono text-lg md:text-xl tracking-[0.2em] text-white/80">
            4821 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 7340
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex justify-between items-end relative z-10">
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-0.5">Funded by</p>
            <p className="text-sm font-mono text-white/60">USDC on Solana</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-0.5">Balance</p>
            <p className="text-sm font-mono text-karma-green">$2,847.50</p>
          </div>
        </div>

        {/* Gradient accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-karma-purple via-karma-pink to-karma-purple" />
      </div>
    </div>
  );
}

function CodeBlock() {
  const [copied, setCopied] = useState(false);
  const code = `curl -X POST https://agents.karmapay.xyz/api/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"agent@example.com"}'

# → { account_id, secret_key: "sk_live_..." }`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-xl bg-black/60 border border-white/[0.06] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
          <span className="text-xs text-white/30 font-mono">terminal</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-sm font-mono">
          <code className="text-karma-green/80">{code}</code>
        </pre>
      </div>
    </div>
  );
}

const STEPS = [
  {
    num: "01",
    title: "Register & verify",
    desc: "Create an account with your email. Complete one-time KYC via a secure link — zero PII touches our API.",
  },
  {
    num: "02",
    title: "Create a card",
    desc: "Provision a virtual card with custom spending limits. Each card gets its own Solana wallet and scoped API key.",
  },
  {
    num: "03",
    title: "Fund with USDC",
    desc: "Send USDC to the card's deposit address. Balance updates in seconds via Helius webhooks. No custodial pool.",
  },
  {
    num: "04",
    title: "Agent spends autonomously",
    desc: "Your agent uses its API key to check balance, verify spend, and get card details for any checkout.",
  },
];

const FEATURES = [
  {
    title: "Scoped API keys",
    desc: "Agent keys can only read balance and spend. They can't withdraw, freeze, or change limits. Owner keeps full control.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    title: "On-chain funding",
    desc: "Each card maps to a dedicated Solana wallet. Card balance equals on-chain USDC balance — fully transparent.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
      </svg>
    ),
  },
  {
    title: "Zero-PII KYC",
    desc: "Identity verification happens on a secure third-party page. Your API never touches personal data.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Real-time webhooks",
    desc: "Deposits detected instantly via Helius. No polling, no delays. Fund and spend within seconds.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "Programmable limits",
    desc: "Set per-transaction, daily, and monthly caps. Freeze or rotate keys instantly. Full owner control.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    title: "Withdraw anytime",
    desc: "Pull USDC back to any Solana wallet at any time. Your funds are never locked.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-karma-purple/[0.07] blur-[150px]" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-karma-pink/[0.04] blur-[120px]" />
      </div>

      {/* Vertical divider lines — matching website-new */}
      <div className="fixed inset-0 pointer-events-none mx-auto max-w-[1440px] hidden lg:block">
        <div className="absolute left-[60px] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute right-[60px] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 w-full px-6 md:px-[120px] py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/karma-logo.png" alt="Karma" className="h-[26px] w-auto" />
            <span className="text-xs font-medium tracking-[-0.24px] text-white/80 hidden sm:inline">Karma Card</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <a href="#how-it-works" className="px-2 py-1.5 rounded-md text-xs font-medium tracking-[-0.24px] text-white/40 hover:bg-white/5 transition-colors">How it works</a>
            <a href="#features" className="px-2 py-1.5 rounded-md text-xs font-medium tracking-[-0.24px] text-white/40 hover:bg-white/5 transition-colors">Features</a>
            <a href="#quickstart" className="px-2 py-1.5 rounded-md text-xs font-medium tracking-[-0.24px] text-white/40 hover:bg-white/5 transition-colors">Quickstart</a>
            <Link href="/agent" className="px-2 py-1.5 rounded-md text-xs font-medium tracking-[-0.24px] text-white/40 hover:bg-white/5 transition-colors">API Docs</Link>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium tracking-[-0.12px] text-[#1d1d1d] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08)] hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative z-10 px-6 md:px-[120px] pt-20 pb-24 md:pt-28 md:pb-36">
        <div className="max-w-[1440px] mx-auto">
          {/* Badge */}
          <motion.div {...fade(0)} className="flex justify-center mb-6">
            <div className="inline-flex h-[26px] items-center gap-2 rounded-[100px] border-[0.5px] border-white/10 bg-gradient-to-r from-white/5 to-white/10 px-[7px] py-1 backdrop-blur-[50px] shadow-[0px_1px_1px_rgba(0,0,0,0.04),0px_1px_3px_rgba(29,29,29,0.02),inset_0px_0px_10px_rgba(255,255,255,0.05)]">
              <span className="h-1.5 w-1.5 rounded-full bg-karma-green animate-glow" />
              <span className="text-[11px] font-normal tracking-[-0.11px] text-white">Give your AI agent a credit card</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fade(0.1)}
            className="text-4xl sm:text-5xl lg:text-[68px] font-medium text-center leading-none tracking-[-0.68px] mb-5"
          >
            The credit card<br />
            <span className="bg-gradient-to-r from-karma-purple via-karma-pink to-karma-purple bg-clip-text text-transparent">
              built for agents
            </span>
          </motion.h1>

          <motion.p
            {...fade(0.2)}
            className="text-base font-normal leading-[1.7] tracking-[-0.16px] text-white/60 text-center max-w-xl mx-auto mb-10"
          >
            Fund with USDC on Solana. Spend anywhere cards are accepted.
            Programmable limits, scoped keys, full owner control.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fade(0.3)} className="flex flex-wrap items-center justify-center gap-3.5 mb-24">
            <Link
              href="/dashboard"
              className="relative inline-flex h-10 items-center justify-center gap-2.5 overflow-hidden rounded-[48px] border border-transparent bg-gradient-to-b from-white to-white/90 px-5 text-sm font-medium leading-4 text-black transition-transform duration-200 hover:scale-[1.02]"
            >
              Create Your First Card
            </Link>
            <Link
              href="/agent"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[38px] border-[0.5px] border-white/20 bg-white/[0.06] px-5 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.12]"
            >
              View API Docs
            </Link>
          </motion.div>

          {/* Card mockup + chat demo side by side */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-5xl mx-auto">
            <motion.div {...fade(0.35)} className="flex justify-center">
              <CardMockup />
            </motion.div>
            <motion.div {...fade(0.4)}>
              <ChatDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ How it works ═══ */}
      <section id="how-it-works" className="relative z-10 px-6 md:px-[120px] py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade()} className="text-center mb-16">
            <p className="text-xs font-mono text-karma-purple/80 uppercase tracking-[0.2em] mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight leading-tight">
              From zero to spending<br className="hidden md:inline" /> in four steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                {...fade(i * 0.08)}
                className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.1] hover:bg-white/[0.04] transition-all"
              >
                <span className="text-3xl font-bold text-karma-purple/20 font-mono">{step.num}</span>
                <h3 className="text-base font-medium mt-3 mb-2">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="relative z-10 px-6 md:px-[120px] py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade()} className="text-center mb-16">
            <p className="text-xs font-mono text-karma-purple/80 uppercase tracking-[0.2em] mb-3">Security & control</p>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight leading-tight">
              Built for autonomous spending<br className="hidden md:inline" /> with human oversight
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                {...fade(i * 0.05)}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 group hover:border-karma-purple/20 hover:bg-white/[0.04] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-karma-purple/10 flex items-center justify-center text-karma-purple mb-4 group-hover:bg-karma-purple/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-base font-medium mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Two payment paths ═══ */}
      <section className="relative z-10 px-6 md:px-[120px] py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade()} className="text-center mb-16">
            <p className="text-xs font-mono text-karma-purple/80 uppercase tracking-[0.2em] mb-3">Where agents pay</p>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
              Two ways to spend
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <motion.div {...fade(0.05)} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 hover:border-white/[0.1] hover:bg-white/[0.04] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-karma-purple/20 to-karma-pink/10 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-karma-purple" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Anywhere cards are accepted</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Virtual cards work at any online checkout — API subscriptions, cloud
                hosting, SaaS tools, domain registrations, and more. Agents get their
                own card number, CVV, and expiry.
              </p>
            </motion.div>

            <motion.div {...fade(0.1)} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 hover:border-white/[0.1] hover:bg-white/[0.04] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-karma-green/20 to-karma-green/5 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-karma-green" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">On-chain with USDC</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Funded by USDC on Solana. Each card has its own wallet address —
                no custodial pool, no off-chain ledger. Deposits and withdrawals
                are fully on-chain.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Quickstart ═══ */}
      <section id="quickstart" className="relative z-10 px-6 md:px-[120px] py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fade()} className="text-center mb-12">
            <p className="text-xs font-mono text-karma-purple/80 uppercase tracking-[0.2em] mb-3">Quickstart</p>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
              One API call to start
            </h2>
            <p className="text-white/40 max-w-lg mx-auto text-base leading-[1.7]">
              Register, verify, create a card, and start spending — all through a simple REST API.
            </p>
          </motion.div>

          <motion.div {...fade(0.1)}>
            <CodeBlock />
          </motion.div>

          <motion.div {...fade(0.15)} className="flex justify-center mt-8">
            <Link
              href="/agent"
              className="text-sm text-karma-purple hover:text-karma-pink transition-colors font-medium"
            >
              View full API reference &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ Built on ═══ */}
      <section className="relative z-10 px-6 md:px-[120px] py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-mono text-white/20 uppercase tracking-[0.2em] mb-6">Built on</p>
          <div className="flex items-center justify-center gap-10 md:gap-14 text-white/20">
            {/* Solana */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 397.7 311.7" fill="currentColor">
                <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/>
                <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"/>
                <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/>
              </svg>
              <span className="text-sm font-medium">Solana</span>
            </div>
            {/* USDC */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
                <circle cx="16" cy="16" r="16" fillOpacity="0.2"/>
                <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm0 22c-5.5 0-10-4.5-10-10S10.5 6 16 6s10 4.5 10 10-4.5 10-10 10z"/>
                <path d="M18.5 14.5c0-1.5-1-2-3-2.3s-2.5-.6-2.5-1.3.7-1.2 1.7-1.2c.9 0 1.5.4 1.7 1.1.1.2.2.3.4.3h.9c.3 0 .4-.2.4-.4-.2-1.2-1-2-2.3-2.2V7.4c0-.2-.2-.4-.5-.4h-.7c-.2 0-.5.2-.5.4v1c-1.5.2-2.5 1.2-2.5 2.5 0 1.6 1 2.1 3 2.4s2.5.7 2.5 1.4-.8 1.3-1.8 1.3c-1.2 0-1.7-.5-1.9-1.2-.1-.2-.2-.3-.4-.3H12c-.3 0-.4.2-.4.4.2 1.3 1.1 2.2 2.6 2.4v1.1c0 .2.2.4.5.4h.7c.2 0 .5-.2.5-.4v-1.1c1.5-.2 2.6-1.3 2.6-2.6z"/>
              </svg>
              <span className="text-sm font-medium">USDC</span>
            </div>
            {/* Helius */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-current opacity-40" />
              <span className="text-sm font-medium">Helius</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 px-6 md:px-[120px] py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            {...fade()}
            className="text-3xl md:text-5xl font-medium tracking-tight mb-5"
          >
            Let your agent pay for anything
          </motion.h2>
          <motion.p
            {...fade(0.05)}
            className="text-base text-white/40 leading-[1.7] mb-10"
          >
            Securely, with programmable limits and full human control.
          </motion.p>
          <motion.div {...fade(0.1)} className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/dashboard"
              className="relative inline-flex h-10 items-center justify-center overflow-hidden rounded-[48px] border border-transparent bg-gradient-to-b from-white to-white/90 px-6 text-sm font-medium text-black transition-transform duration-200 hover:scale-[1.02]"
            >
              Get Started Free
            </Link>
            <a
              href="https://github.com/AquaAgent/karma-agent"
              target="_blank"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[38px] border-[0.5px] border-white/20 bg-white/[0.06] px-6 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.12]"
            >
              View on GitHub
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 md:px-[120px] py-8">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/karma-logo.png" alt="Karma" className="h-5 w-auto opacity-50" />
            <span className="text-xs text-white/25">Built by the team at karmapay.xyz</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/25">
            <a href="https://karmapay.xyz" target="_blank" className="hover:text-white/50 transition-colors">
              karmapay.xyz
            </a>
            <a href="https://x.com/karmawallet" target="_blank" className="hover:text-white/50 transition-colors">
              @karmawallet
            </a>
            <a href="https://github.com/AquaAgent/karma-agent" target="_blank" className="hover:text-white/50 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
