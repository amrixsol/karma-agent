"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-karma-purple/10 blur-[120px] animate-glow pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <img src="/karma-logo.png" alt="Karma" className="h-20 w-auto" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight"
      >
        AI Credit Cards
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg text-white/50 text-center mb-12 max-w-md"
      >
        Credit cards for AI agents, backed by USDC on Solana.
        Fund with crypto, spend anywhere.
      </motion.p>

      {/* Two paths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-lg"
      >
        <Link href="/agent" className="flex-1">
          <div className="glass glass-hover rounded-2xl p-6 cursor-pointer transition-all duration-300 h-full">
            <div className="text-2xl mb-3">🤖</div>
            <h2 className="text-lg font-semibold mb-2">I&apos;m an Agent</h2>
            <p className="text-sm text-white/40">
              Get API docs and a one-liner to give your AI agent a credit card.
            </p>
          </div>
        </Link>

        <Link href="/dashboard" className="flex-1">
          <div className="glass glass-hover rounded-2xl p-6 cursor-pointer transition-all duration-300 h-full">
            <div className="text-2xl mb-3">👤</div>
            <h2 className="text-lg font-semibold mb-2">I&apos;m a Human</h2>
            <p className="text-sm text-white/40">
              Set up and manage agent cards through a visual dashboard.
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-16 flex items-center gap-4 text-sm text-white/30"
      >
        <a
          href="https://karmapay.xyz"
          target="_blank"
          className="hover:text-white/60 transition-colors"
        >
          karmapay.xyz
        </a>
        <span>·</span>
        <a
          href="https://x.com/karmawallet"
          target="_blank"
          className="hover:text-white/60 transition-colors"
        >
          @karmawallet
        </a>
        <span>·</span>
        <a
          href="https://github.com/amrixsol/karma-agent"
          target="_blank"
          className="hover:text-white/60 transition-colors"
        >
          GitHub
        </a>
      </motion.div>
    </div>
  );
}
