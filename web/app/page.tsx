"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.6, delay, ease: [0, 0, 0.2, 1] as const },
});

/* ─── Animated Chat Demo ─── */

interface DemoScenario {
  human: string;
  tool: string;
  agent: string;
}

const SCENARIOS: DemoScenario[] = [
  {
    human: "Buy 3 months of Vercel Pro for the staging project",
    tool: "karma::check_balance() → $500.00\nkarma::pay(amount: $60.00, merchant: \"Vercel\")",
    agent: "Done. Paid $60.00 with card ****4821. Invoice from Vercel confirmed. Remaining daily limit: $440.",
  },
  {
    human: "Pay the Anthropic API invoice that came in today",
    tool: "karma::check_balance() → $440.00\nkarma::pay(amount: $312.50, merchant: \"Anthropic\")",
    agent: "Found invoice #ANT-8842 for $312.50. Paid with card ****4821. Receipt saved to workspace.",
  },
  {
    human: "Can I afford to buy a .com domain on Namecheap?",
    tool: "karma::check_balance() → $127.50\nkarma::lookup_price(merchant: \"Namecheap\", item: \".com domain\")",
    agent: "$9.98 + $0.16 ICANN fee = $10.14 total. You have $127.50 available — yes, you can afford it.",
  },
];

type Phase = "typing-human" | "typing-tool" | "typing-agent" | "done" | "scroll-out";

function AnimatedChat() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing-human");
  const [displayedText, setDisplayedText] = useState("");

  const scenario = SCENARIOS[scenarioIdx];

  const currentFullText =
    phase === "typing-human" ? scenario.human :
    phase === "typing-tool" ? scenario.tool :
    phase === "typing-agent" ? scenario.agent : "";

  useEffect(() => {
    if (phase === "done" || phase === "scroll-out") return;

    if (displayedText.length < currentFullText.length) {
      const speed = phase === "typing-tool" ? 12 : 25;
      const timer = setTimeout(() => {
        setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    }

    const delay = phase === "typing-human" ? 400 : phase === "typing-tool" ? 600 : 2000;
    const timer = setTimeout(() => {
      if (phase === "typing-human") {
        setDisplayedText("");
        setPhase("typing-tool");
      } else if (phase === "typing-tool") {
        setDisplayedText("");
        setPhase("typing-agent");
      } else if (phase === "typing-agent") {
        setPhase("done");
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [displayedText, phase, currentFullText]);

  useEffect(() => {
    if (phase !== "done") return;
    const timer = setTimeout(() => {
      setPhase("scroll-out");
      setTimeout(() => {
        setScenarioIdx((i) => (i + 1) % SCENARIOS.length);
        setDisplayedText("");
        setPhase("typing-human");
      }, 400);
    }, 2500);
    return () => clearTimeout(timer);
  }, [phase]);

  const goTo = useCallback((i: number) => {
    setScenarioIdx(i);
    setDisplayedText("");
    setPhase("typing-human");
  }, []);

  const showHuman = phase !== "typing-human" || displayedText.length > 0;
  const showTool = phase === "typing-tool" || phase === "typing-agent" || phase === "done" || phase === "scroll-out";
  const showAgent = phase === "typing-agent" || phase === "done" || phase === "scroll-out";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-black/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-black/10" />
            <div className="w-2 h-2 rounded-full bg-black/10" />
            <div className="w-2 h-2 rounded-full bg-black/10" />
          </div>
          <span className="flex-1 text-center text-[11px] text-black/25 font-mono">karma-agent</span>
        </div>

        <div className={`p-5 min-h-[220px] flex flex-col gap-3 transition-opacity duration-300 ${phase === "scroll-out" ? "opacity-0" : "opacity-100"}`}>
          {showHuman && (
            <div className="flex justify-end">
              <div className="bg-karma-purple/8 border border-karma-purple/10 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-sm text-black/70 leading-relaxed">
                  {phase === "typing-human" ? displayedText : scenario.human}
                  {phase === "typing-human" && <span className="inline-block w-0.5 h-3.5 bg-karma-purple/60 ml-0.5 animate-pulse align-middle" />}
                </p>
              </div>
            </div>
          )}

          {showTool && (
            <div className="flex justify-start">
              <div className="bg-black/[0.02] border border-black/[0.06] rounded-xl px-3.5 py-2 max-w-[90%]">
                <p className="text-[11px] font-mono text-black/35 leading-relaxed whitespace-pre-line">
                  {phase === "typing-tool" ? displayedText : scenario.tool}
                  {phase === "typing-tool" && <span className="inline-block w-0.5 h-3 bg-black/30 ml-0.5 animate-pulse align-middle" />}
                </p>
              </div>
            </div>
          )}

          {showAgent && (
            <div className="flex justify-start">
              <div className="bg-black/[0.03] border border-black/[0.06] rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%]">
                <p className="text-sm text-black/55 leading-relaxed">
                  {phase === "typing-agent" ? displayedText : scenario.agent}
                  {phase === "typing-agent" && <span className="inline-block w-0.5 h-3.5 bg-black/30 ml-0.5 animate-pulse align-middle" />}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-3 justify-center">
        {SCENARIOS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
              i === scenarioIdx ? "w-5 bg-karma-purple" : "w-1 bg-black/10 hover:bg-black/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── For Agents / For Humans Panel (lobster.cash + colosseum style) ─── */

const SKILL_URL = "https://agents.karmapay.xyz/skill.md";

function HeroPanel() {
  const [tab, setTab] = useState<"agents" | "humans">("agents");
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-sm">
        {/* Tab toggle */}
        <div className="flex border-b border-black/[0.06]">
          <button
            onClick={() => setTab("agents")}
            className={`flex-1 py-3.5 text-sm font-medium transition-all cursor-pointer ${
              tab === "agents"
                ? "text-[#111] bg-white"
                : "text-black/35 bg-black/[0.02] hover:text-black/50"
            }`}
          >
            For agents
          </button>
          <button
            onClick={() => setTab("humans")}
            className={`flex-1 py-3.5 text-sm font-medium transition-all cursor-pointer ${
              tab === "humans"
                ? "text-[#111] bg-white"
                : "text-black/35 bg-black/[0.02] hover:text-black/50"
            }`}
          >
            For humans
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === "agents" ? (
            <div>
              {/* Skill URL code block — like Colosseum's curl command */}
              <div className="bg-[#0e0e0f] rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-sm font-mono text-karma-green break-all">
                    curl -s {SKILL_URL}
                  </code>
                  <button
                    onClick={() => copy(`curl -s ${SKILL_URL}`)}
                    className="shrink-0 text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Numbered steps */}
              <ol className="space-y-3 text-sm text-black/55">
                <li className="flex gap-3">
                  <span className="text-karma-purple font-medium">1.</span>
                  Run the command above — your agent gets the full API spec
                </li>
                <li className="flex gap-3">
                  <span className="text-karma-purple font-medium">2.</span>
                  Register & send your human the KYC link
                </li>
                <li className="flex gap-3">
                  <span className="text-karma-purple font-medium">3.</span>
                  Create a card, fund with USDC, and start spending
                </li>
              </ol>
            </div>
          ) : (
            <div>
              <ol className="space-y-3 text-sm text-black/55">
                <li className="flex gap-3">
                  <span className="text-karma-purple font-medium">1.</span>
                  Sign up with email on the dashboard
                </li>
                <li className="flex gap-3">
                  <span className="text-karma-purple font-medium">2.</span>
                  Complete one-time KYC through our secure partner (Sumsub)
                </li>
                <li className="flex gap-3">
                  <span className="text-karma-purple font-medium">3.</span>
                  Create a virtual card, set spending limits, and fund with USDC
                </li>
                <li className="flex gap-3">
                  <span className="text-karma-purple font-medium">4.</span>
                  Share the scoped API key with your agent — it can only spend, not withdraw
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-full h-11 rounded-xl bg-karma-purple text-white text-sm font-medium hover:bg-karma-purple/90 transition-colors"
          >
            {tab === "agents" ? "Get API access" : "Create account"}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Steps ─── */

const STEPS = [
  {
    num: "1",
    title: "Create an agent wallet",
    desc: "Register with email + one-time KYC. Get a virtual card with its own Solana wallet. Zero PII touches your API.",
  },
  {
    num: "2",
    title: "Agent requests a scoped payment method",
    desc: "Use the API to retrieve card details scoped to specific limits — per-transaction, daily, and monthly caps.",
  },
  {
    num: "3",
    title: "Agent pays autonomously",
    desc: "Agent can spend for the use cases and amounts authorized by the human. Full control, full transparency.",
  },
];

/* ─── Where Accepted ─── */

function WhereAccepted() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <motion.div
        {...fade(0)}
        className="relative rounded-2xl border border-black/[0.06] bg-white p-8 overflow-hidden"
      >
        <div className="relative z-10">
          <p className="text-lg font-medium mb-1">Where <span className="text-karma-purple">Visa</span> is accepted</p>
          <p className="text-sm text-black/40 leading-relaxed">
            150M+ merchants in 200+ countries and territories. Online, in-store, everywhere.
          </p>
        </div>
      </motion.div>
      <motion.div
        {...fade(0.06)}
        className="relative rounded-2xl border border-black/[0.06] bg-white p-8 overflow-hidden"
      >
        <div className="relative z-10">
          <p className="text-lg font-medium mb-1">Fund with <span className="text-karma-purple">USDC on Solana</span></p>
          <p className="text-sm text-black/40 leading-relaxed">
            Send USDC to your deposit address. Balance updates in seconds. No banks, no delays.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Logo ─── */

function KarmaLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src="/karma-logo.png" alt="Karma" className="h-6 w-auto" />
      <span className="text-sm font-medium text-black/80 tracking-tight">Karma</span>
    </div>
  );
}

/* ─── Page ─── */

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white text-[#111]">
      {/* Announcement bar */}
      <a
        href="https://colosseum.com/agent-hackathon/projects/karma-agent-cards?from=leaderboard"
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-30 block w-full bg-[#111] text-center py-2 px-4 text-xs text-white/70 hover:text-white transition-colors"
      >
        &#127942; We&apos;re competing in Solana&apos;s first AI Agent Hackathon — <span className="text-white underline underline-offset-2">vote for us</span>
      </a>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-karma-purple/[0.07] blur-[120px]" />
        <div className="absolute top-[-100px] right-[10%] w-[400px] h-[400px] rounded-full bg-karma-pink/[0.05] blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 w-full px-6 md:px-[120px] py-5">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <KarmaLogo />
          <div className="hidden md:flex items-center gap-1">
            <a href="#how-it-works" className="px-2.5 py-1.5 rounded-md text-xs font-medium text-black/40 hover:text-black/60 transition-colors">How it works</a>
            <a href="#demo" className="px-2.5 py-1.5 rounded-md text-xs font-medium text-black/40 hover:text-black/60 transition-colors">Demo</a>
            <a href="#video" className="px-2.5 py-1.5 rounded-md text-xs font-medium text-black/40 hover:text-black/60 transition-colors">Video</a>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-black/10 px-3.5 py-1.5 text-xs font-medium text-black/70 hover:bg-black/[0.03] transition-colors"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative z-10 px-6 md:px-[120px] pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="max-w-[1280px] mx-auto text-center">
          {/* Card visual */}
          <motion.div {...fade(0)} className="flex justify-center mb-10 md:mb-14">
            <div className="relative">
              <div className="absolute inset-0 bg-karma-purple/12 blur-[50px] rounded-full scale-150" />
              <div className="absolute inset-0 bg-karma-pink/8 blur-[70px] rounded-full scale-125 translate-x-6" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://imagedelivery.net/nt6NYzDSWpHuFP3mrObYNQ/475a75d9-2637-4c9e-e7e9-0891b4ed0900/public"
                alt="Karma Agent Card"
                className="relative w-full max-w-[300px] drop-shadow-2xl"
              />
            </div>
          </motion.div>

          <motion.h1
            {...fade(0.08)}
            className="text-4xl sm:text-5xl lg:text-[56px] font-medium leading-[1.1] tracking-[-0.02em] mb-5"
          >
            The credit card<br />
            <span className="bg-gradient-to-r from-karma-purple to-karma-pink bg-clip-text text-transparent">
              built for agents
            </span>
          </motion.h1>

          <motion.p
            {...fade(0.14)}
            className="text-base leading-[1.7] text-black/45 max-w-lg mx-auto mb-10"
          >
            Give your agent a credit card with programmable limits, scoped API keys,
            and full human control. Fund with USDC, accepted at 150M+ merchants.
          </motion.p>

          {/* Powered by logos */}
          <motion.div {...fade(0.2)} className="mb-12">
            <p className="text-xs text-black/30 mb-4">Powered by</p>
            <div className="flex items-center justify-center gap-8 md:gap-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://imagedelivery.net/nt6NYzDSWpHuFP3mrObYNQ/1e5abb82-8500-455b-4198-a68a18bfa100/public" alt="Solana" className="h-4 opacity-50" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://imagedelivery.net/nt6NYzDSWpHuFP3mrObYNQ/b6dc88a0-87b3-465a-2170-1218fc0df400/public" alt="Circle" className="h-5 opacity-50" />
            </div>
          </motion.div>

          {/* For agents / For humans panel */}
          <motion.div {...fade(0.26)}>
            <HeroPanel />
          </motion.div>
        </div>
      </section>

      {/* ═══ How it works ═══ */}
      <section id="how-it-works" className="relative z-10 px-6 md:px-[120px] py-20 md:py-28">
        <div className="max-w-[960px] mx-auto">
          <motion.p {...fade()} className="text-xs font-mono text-karma-purple/60 uppercase tracking-[0.2em] text-center mb-3">
            How it works
          </motion.p>
          <motion.h2 {...fade(0.05)} className="text-2xl md:text-3xl font-medium tracking-tight text-center mb-14">
            Three steps to autonomous spending
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                {...fade(i * 0.06)}
                className="rounded-xl border border-black/[0.06] bg-white p-6"
              >
                <span className="w-7 h-7 rounded-full bg-karma-purple/10 text-karma-purple text-xs font-semibold flex items-center justify-center mb-3">
                  {step.num}
                </span>
                <h3 className="text-sm font-medium mb-1.5">{step.title}</h3>
                <p className="text-xs text-black/40 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Where accepted ═══ */}
      <section className="relative z-10 px-6 md:px-[120px] py-12 md:py-16">
        <div className="max-w-[960px] mx-auto">
          <WhereAccepted />
        </div>
      </section>

      {/* ═══ Demo ═══ */}
      <section id="demo" className="relative z-10 px-6 md:px-[120px] py-20 md:py-28">
        <div className="max-w-[960px] mx-auto">
          <motion.p {...fade()} className="text-xs font-mono text-karma-purple/60 uppercase tracking-[0.2em] text-center mb-3">
            See it in action
          </motion.p>
          <motion.h2 {...fade(0.05)} className="text-2xl md:text-3xl font-medium tracking-tight text-center mb-12">
            Your agent, paying for things
          </motion.h2>
          <motion.div {...fade(0.1)}>
            <AnimatedChat />
          </motion.div>
        </div>
      </section>

      {/* ═══ Video ═══ */}
      <section id="video" className="relative z-10 px-6 md:px-[120px] py-20 md:py-28">
        <div className="max-w-[960px] mx-auto">
          <motion.p {...fade()} className="text-xs font-mono text-karma-purple/60 uppercase tracking-[0.2em] text-center mb-3">
            Watch
          </motion.p>
          <motion.h2 {...fade(0.05)} className="text-2xl md:text-3xl font-medium tracking-tight text-center mb-12">
            Karma Card in 2 minutes
          </motion.h2>
          <motion.div {...fade(0.1)} className="relative w-full aspect-video rounded-2xl overflow-hidden border border-black/[0.06] shadow-sm bg-black">
            <iframe
              src="https://customer-n0noevuwva7213vx.cloudflarestream.com/197b4409afad928b9840fd5b58c81247/iframe"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 px-6 md:px-[120px] py-20 md:py-28">
        <div className="max-w-md mx-auto text-center">
          <motion.h2
            {...fade()}
            className="text-2xl md:text-3xl font-medium tracking-tight mb-4"
          >
            Let your agent pay for anything
          </motion.h2>
          <motion.p {...fade(0.05)} className="text-sm text-black/40 leading-relaxed mb-8">
            Programmable limits. Scoped keys. Full human control.
          </motion.p>
          <motion.div {...fade(0.1)} className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-full bg-[#111] px-5 text-sm font-medium text-white hover:bg-black transition-colors"
            >
              Get Started
            </Link>
            <a
              href="https://github.com/AquaAgent/karma-agent"
              target="_blank"
              className="inline-flex h-10 items-center rounded-full border border-black/10 px-5 text-sm font-medium text-black/60 hover:bg-black/[0.03] transition-colors"
            >
              GitHub
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 border-t border-black/[0.06] px-6 md:px-[120px] py-6">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <KarmaLogo className="opacity-40" />
          <div className="flex items-center gap-5 text-[11px] text-black/25">
            <a href="https://karmapay.xyz" target="_blank" className="hover:text-black/50 transition-colors">karmapay.xyz</a>
            <a href="https://x.com/karmawallet" target="_blank" className="hover:text-black/50 transition-colors">@karmawallet</a>
            <a href="https://github.com/AquaAgent/karma-agent" target="_blank" className="hover:text-black/50 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
