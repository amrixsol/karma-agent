/**
 * Create a new virtual card for an agent.
 * Uses the owner (sk_live) key — run this once, then give the agent its sk_agent key.
 *
 * Usage:
 *   KARMA_API_KEY=sk_live_... npx tsx examples/create-card.ts
 */

import { KarmaOwner } from "../src/karma-client.js";

const owner = new KarmaOwner(process.env.KARMA_API_KEY!);

const card = await owner.createCard({
  name: "Shopping Agent",
  per_txn_limit: 100,
  daily_limit: 500,
  monthly_limit: 2000,
});

console.log("Card created:");
console.log(`  Card ID:         ${card.card_id}`);
console.log(`  Last 4:          ${card.last4}`);
console.log(`  Deposit address: ${card.deposit_address}`);
console.log(`  Agent key:       ${card.agent_api_key}`);
console.log("\nSend USDC to the deposit address to fund the card.");
console.log("Give the agent key to your AI agent.");
