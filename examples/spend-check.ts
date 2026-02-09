/**
 * Check if the agent can afford a purchase before proceeding.
 *
 * Usage:
 *   KARMA_AGENT_KEY=sk_agent_... npx tsx examples/spend-check.ts 49.99
 */

import { KarmaAgent } from "../src/karma-client.js";

const agent = new KarmaAgent(process.env.KARMA_AGENT_KEY!);
const amount = parseFloat(process.argv[2] || "10");

const result = await agent.canSpend(amount);

if (result.allowed) {
  console.log(`Can spend $${amount}: YES`);
  console.log(`  Fees:  $${result.fees.toFixed(2)}`);
  console.log(`  Total: $${result.total.toFixed(2)}`);
} else {
  console.log(`Can spend $${amount}: NO`);
  console.log(`  Available: $${result.available.toFixed(2)}`);
  console.log(`  Needed:    $${result.total.toFixed(2)}`);
}
