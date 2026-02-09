"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function CreditCardVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -10, rotateX: 5 }}
      animate={{ opacity: 1, rotateY: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="relative w-[340px] h-[210px] mx-auto"
      style={{ perspective: "1000px" }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-karma-purple via-karma-pink/80 to-karma-purple/60 p-[1px]">
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#1a0a2e] via-[#1e1030] to-[#12081d] p-6 flex flex-col justify-between card-shine">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <img src="/karma-logo.png" alt="Karma" className="w-7 h-7 opacity-80" />
              <span className="text-xs font-medium text-white/50 tracking-wider uppercase">Karma</span>
            </div>
            <span className="text-[10px] font-medium text-white/30 tracking-widest">VISA</span>
          </div>
          <div>
            <p className="font-mono text-lg tracking-[0.2em] text-white/80 mb-3">
              4242 •••• •••• 1337
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-0.5">Agent</p>
                <p className="text-xs text-white/60 font-medium">AI SHOPPING AGENT</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-0.5">Balance</p>
                <p className="text-xs text-karma-green font-mono font-medium">$2,450.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-grid">
      {/* Background effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-karma-purple/8 blur-[160px] animate-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-karma-pink/5 blur-[120px] animate-glow pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <img src="/karma-logo.png" alt="Karma" className="w-16 h-16" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl md:text-6xl font-bold text-center mb-3 tracking-tight"
      >
        <span className="text-gradient">AI Credit Cards</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-base text-white/40 text-center mb-10 max-w-md leading-relaxed"
      >
        Virtual Visa cards for AI agents, backed by USDC on Solana.
        <br />
        Fund with crypto, spend anywhere.
      </motion.p>

      {/* Card visual */}
      <div className="mb-12 animate-float">
        <CreditCardVisual />
      </div>

      {/* Feature badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap justify-center gap-2 mb-10"
      >
        {["Solana", "USDC", "Visa Network", "Per-txn Limits", "Scoped API Keys"].map((tag, i) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-[11px] font-medium bg-white/[0.04] border border-white/[0.06] text-white/40"
          >
            {tag}
          </span>
        ))}
      </motion.div>

      {/* Two paths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-lg"
      >
        <Link href="/agent" className="flex-1">
          <div className="glass glass-hover rounded-2xl p-6 cursor-pointer h-full">
            <div className="w-10 h-10 rounded-xl bg-karma-purple/10 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-karma-purple">
                <path d="M12 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4z" />
                <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                <circle cx="12" cy="6" r="1" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-1.5">I&apos;m an Agent</h2>
            <p className="text-sm text-white/35 leading-relaxed">
              Get API docs and a one-liner to give your AI agent a credit card.
            </p>
          </div>
        </Link>

        <Link href="/dashboard" className="flex-1">
          <div className="glass glass-hover rounded-2xl p-6 cursor-pointer h-full">
            <div className="w-10 h-10 rounded-xl bg-karma-pink/10 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-karma-pink">
                <rect x="2" y="5" width="20" height="14" rx="3" />
                <path d="M2 10h20" />
                <path d="M6 15h4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-1.5">I&apos;m a Human</h2>
            <p className="text-sm text-white/35 leading-relaxed">
              Set up and manage agent cards through a visual dashboard.
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-16 flex items-center gap-6 text-xs text-white/25"
      >
        <a
          href="https://karmapay.xyz"
          target="_blank"
          className="hover:text-white/50 transition-colors"
        >
          karmapay.xyz
        </a>
        <span className="w-1 h-1 rounded-full bg-white/15" />
        <a
          href="https://x.com/karmawallet"
          target="_blank"
          className="hover:text-white/50 transition-colors"
        >
          @karmawallet
        </a>
        <span className="w-1 h-1 rounded-full bg-white/15" />
        <a
          href="https://github.com/amrixsol/karma-agent"
          target="_blank"
          className="hover:text-white/50 transition-colors"
        >
          GitHub
        </a>
      </motion.div>
    </div>
  );
}
