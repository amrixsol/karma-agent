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

# 2. Complete KYC (one-time, no PII needed)
curl -X POST https://agents.karmapay.xyz/api/kyc \\
  -H "Authorization: Bearer sk_live_..."
# → { status: "pending_verification", kyc_url }
# Human opens kyc_url → verifies on Sumsub (ID + selfie)
# Agent polls: GET /api/kyc/status until "approved"

# 3. Create a card
curl -X POST https://agents.karmapay.xyz/api/cards \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My Agent","per_txn_limit":100}'
# → { card_id, agent_api_key: "sk_agent_...", deposit_address }

# 4. Fund it — send USDC to the deposit_address

# 5. Agent can now use sk_agent_... key:
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
      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all duration-200 cursor-pointer"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

export default function AgentPage() {
  return (
    <div className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <Link
          href="/"
          className="text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          ← Back
        </Link>

        <div className="flex items-center gap-4 mt-6 mb-4">
          <img src="/karma-logo.png" alt="Karma" className="h-10 w-auto" />
          <h1 className="text-3xl font-bold">Agent Setup</h1>
        </div>
        <p className="text-white/50">
          Give your AI agent a credit card in 5 minutes.
        </p>
      </motion.div>

      {/* Skill URL */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <h2 className="text-lg font-semibold mb-3">
          Read the skill file
        </h2>
        <p className="text-sm text-white/40 mb-4">
          Everything you need — registration, KYC, card creation, and spending
          endpoints — is in one file:
        </p>
        <div className="bg-black/40 rounded-xl p-4 font-mono text-sm text-karma-green mb-3 overflow-x-auto">
          curl -s {SKILL_URL}
        </div>
        <CopyButton text={`curl -s ${SKILL_URL}`} label="Copy command" />
      </motion.section>

      {/* Quick reference */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <h2 className="text-lg font-semibold mb-3">Quick API Reference</h2>
        <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-white/60 overflow-x-auto whitespace-pre">
          {QUICK_START}
        </div>
        <div className="mt-4">
          <a
            href="https://github.com/amrixsol/karma-agent/blob/main/SKILL.md"
            target="_blank"
            className="text-sm text-karma-purple hover:text-karma-pink transition-colors"
          >
            Full API docs →
          </a>
        </div>
      </motion.section>

      {/* Security note */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <h2 className="text-lg font-semibold mb-3">Security Model</h2>
        <div className="space-y-3 text-sm text-white/50">
          <div className="flex gap-3">
            <span className="text-karma-green font-mono text-xs bg-karma-green/10 px-2 py-1 rounded">
              sk_agent_
            </span>
            <span>
              Scoped to one card. Can check balance, verify spend, get card
              details, view history. Cannot withdraw, freeze, or change limits.
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-karma-purple font-mono text-xs bg-karma-purple/10 px-2 py-1 rounded">
              sk_live_
            </span>
            <span>
              Owner key. Full access: create cards, set limits, freeze/unfreeze,
              withdraw USDC, rotate agent keys.
            </span>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
