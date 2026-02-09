/**
 * Karma Agent Demo
 *
 * An autonomous AI agent that manages its own credit card on Solana.
 * Demonstrates the full lifecycle: balance check, spend verification,
 * card retrieval, and transaction history.
 *
 * Usage:
 *   KARMA_AGENT_KEY=sk_agent_... npx tsx src/agent.ts
 */

import { KarmaAgent } from "./karma-client.js";

const AGENT_KEY = process.env.KARMA_AGENT_KEY;

if (!AGENT_KEY) {
  console.error("Set KARMA_AGENT_KEY environment variable (sk_agent_...)");
  process.exit(1);
}

const agent = new KarmaAgent(AGENT_KEY);

async function run() {
  console.log("=== Karma Agent Demo ===\n");

  // Step 1: Check balance
  console.log("[1] Checking balance...");
  const balance = await agent.getBalance();
  console.log(`    Available: $${balance.available.toFixed(2)} USDC`);
  console.log(`    Total:     $${balance.balance.toFixed(2)} USDC`);
  console.log(`    Pending:   $${balance.pending_holds.toFixed(2)} USDC`);
  console.log(`    Daily remaining:   $${balance.daily_remaining.toFixed(2)}`);
  console.log(`    Monthly remaining: $${balance.monthly_remaining.toFixed(2)}`);
  console.log(`    Deposit address:   ${balance.deposit_address}\n`);

  // Step 2: Can we afford a $25 purchase?
  const purchaseAmount = 25.0;
  console.log(`[2] Can I spend $${purchaseAmount}?`);
  const check = await agent.canSpend(purchaseAmount);
  console.log(`    Allowed: ${check.allowed}`);
  console.log(`    Fees:    $${check.fees.toFixed(2)}`);
  console.log(`    Total:   $${check.total.toFixed(2)}\n`);

  if (!check.allowed) {
    console.log("    Not enough balance or budget. Stopping here.");
    return;
  }

  // Step 3: Get card details for checkout
  console.log("[3] Retrieving card for checkout...");
  const card = await agent.getCardDetails();
  const masked = `**** **** **** ${card.number.slice(-4)}`;
  console.log(`    Card:   ${masked}`);
  console.log(`    Expiry: ${card.expiry_month}/${card.expiry_year}`);
  console.log(`    CVV:    ***\n`);

  // Step 4: Recent transactions
  console.log("[4] Recent transactions:");
  const { transactions } = await agent.getTransactions(5);
  if (transactions.length === 0) {
    console.log("    No transactions yet.");
  } else {
    for (const tx of transactions) {
      const sign = tx.type === "credit" ? "+" : "-";
      console.log(
        `    ${sign}$${tx.amount.toFixed(2)} ${tx.currency} — ${tx.merchant || tx.type} (${tx.status})`,
      );
    }
  }

  console.log("\n=== Done ===");
}

run().catch((err) => {
  console.error("Agent error:", err.message);
  process.exit(1);
});
