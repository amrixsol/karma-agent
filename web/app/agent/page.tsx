"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const SKILL_URL = "https://agents.karmapay.xyz/skill.md";

const QUICK_START = `# 1. Register
curl -X POST https://agents.karmapay.xyz/api/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@example.com"}'
# → { account_id, secret_key: "sk_live_..." }

# 2. Complete KYC (one-time)
curl -X POST https://agents.karmapay.xyz/api/kyc \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"firstName":"...", ...}'
# → { status, kyc_url } — open kyc_url in browser

# 3. Create a card
curl -X POST https://agents.karmapay.xyz/api/cards \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My Agent","per_txn_limit":100}'
# → { card_id, agent_api_key: "sk_agent_...", deposit_address }

# 4. Fund it — send USDC to the deposit_address

# 5. Agent endpoints (use sk_agent_... key):
#    GET  /api/spend/balance
#    GET  /api/spend/card        (PAN, CVV, expiry)
#    POST /api/spend/can-spend   {"amount": 49.99}
#    GET  /api/spend/transactions`;

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium transition-all duration-200 cursor-pointer text-white/60 hover:text-white/80"
    >
      {copied ? (
        <span className="text-karma-green">Copied!</span>
      ) : (
        label
      )}
    </button>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <div className="w-7 h-7 rounded-lg bg-karma-purple/15 flex items-center justify-center text-xs font-bold text-karma-purple shrink-0">
      {n}
    </div>
  );
}

export default function AgentPage() {
  return (
    <div className="min-h-screen px-6 py-12 max-w-3xl mx-auto bg-grid relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-karma-purple/5 blur-[160px] pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 relative"
      >
        <Link
          href="/"
          className="text-xs text-white/25 hover:text-white/50 transition-colors"
        >
          &larr; Back
        </Link>

        <div className="flex items-center gap-4 mt-6 mb-3">
          <img src="/karma-logo.png" alt="Karma" className="w-10 h-10" />
          <h1 className="text-3xl font-bold tracking-tight">Agent Setup</h1>
        </div>
        <p className="text-white/40 text-sm">
          Give your AI agent a credit card in 5 minutes.
        </p>
      </motion.div>

      {/* Option 1: One-liner */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <StepNumber n={1} />
          <div>
            <h2 className="text-base font-semibold">Give your agent this command</h2>
            <p className="text-xs text-white/30">Any AI agent that can read a URL can use this.</p>
          </div>
        </div>
        <div className="code-block text-karma-green mb-3">
          curl -s {SKILL_URL}
        </div>
        <CopyButton text={`curl -s ${SKILL_URL}`} label="Copy command" />
      </motion.section>

      {/* Option 2: System prompt */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 mb-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <StepNumber n={2} />
          <div>
            <h2 className="text-base font-semibold">Add to system prompt</h2>
            <p className="text-xs text-white/30">For Claude, ChatGPT, or any LLM.</p>
          </div>
        </div>
        <div className="code-block text-white/60 whitespace-pre-wrap mb-3">
          {`You have access to a Karma credit card. Read the API docs at:\n${SKILL_URL}\n\nYour API key is: sk_agent_...\nUse it to check balance, verify purchases, and get card details for checkout.`}
        </div>
        <CopyButton
          text={`You have access to a Karma credit card. Read the API docs at:\n${SKILL_URL}\n\nYour API key is: sk_agent_...\nUse it to check balance, verify purchases, and get card details for checkout.`}
          label="Copy prompt"
        />
      </motion.section>

      {/* Option 3: Interactive CLI */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 mb-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <StepNumber n={3} />
          <div>
            <h2 className="text-base font-semibold">Run the interactive agent</h2>
            <p className="text-xs text-white/30">CLI that walks through the entire setup.</p>
          </div>
        </div>
        <div className="code-block text-karma-green mb-3">
          <span className="text-white/30">$</span> git clone https://github.com/amrixsol/karma-agent.git{"\n"}
          <span className="text-white/30">$</span> cd karma-agent && npm install{"\n"}
          <span className="text-white/30">$</span> npx tsx src/agent.ts
        </div>
        <CopyButton
          text="git clone https://github.com/amrixsol/karma-agent.git && cd karma-agent && npm install && npx tsx src/agent.ts"
          label="Copy commands"
        />
      </motion.section>

      {/* Quick reference */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6 mb-4"
      >
        <h2 className="text-base font-semibold mb-4">Quick API Reference</h2>
        <div className="code-block text-white/50 whitespace-pre text-xs leading-relaxed">
          {QUICK_START}
        </div>
        <div className="mt-4">
          <a
            href="https://github.com/amrixsol/karma-agent/blob/main/SKILL.md"
            target="_blank"
            className="text-xs text-karma-purple hover:text-karma-pink transition-colors font-medium"
          >
            Full API docs &rarr;
          </a>
        </div>
      </motion.section>

      {/* Security note */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6 mb-4"
      >
        <h2 className="text-base font-semibold mb-4">Security Model</h2>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <code className="text-karma-green text-[11px] bg-karma-green/8 px-2.5 py-1 rounded-md font-mono shrink-0 border border-karma-green/10">
              sk_agent_
            </code>
            <p className="text-sm text-white/40 leading-relaxed">
              Scoped to one card. Can check balance, verify spend, get card
              details, view history. Cannot withdraw, freeze, or change limits.
            </p>
          </div>
          <div className="w-full h-px bg-white/[0.04]" />
          <div className="flex gap-3 items-start">
            <code className="text-karma-purple text-[11px] bg-karma-purple/8 px-2.5 py-1 rounded-md font-mono shrink-0 border border-karma-purple/10">
              sk_live_
            </code>
            <p className="text-sm text-white/40 leading-relaxed">
              Owner key. Full access: create cards, set limits, freeze/unfreeze,
              withdraw USDC, rotate agent keys.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
