/**
 * Check the balance of your agent's card.
 *
 * Usage:
 *   KARMA_AGENT_KEY=sk_agent_... npx tsx examples/check-balance.ts
 */

import { KarmaAgent } from "../src/karma-client.js";

const agent = new KarmaAgent(process.env.KARMA_AGENT_KEY!);

const balance = await agent.getBalance();
console.log(balance);
