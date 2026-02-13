#!/usr/bin/env node

/**
 * Karma Agent — Interactive setup and operational CLI
 *
 * Walks through the full lifecycle:
 *   1. Register an account
 *   2. Submit KYC (human completes verification link)
 *   3. Create a virtual card with spending limits
 *   4. Show deposit address for USDC funding
 *   5. Enter operational mode: balance, spend checks, card details
 *
 * State is saved to ~/.karma-agent.json so you can resume at any step.
 *
 * Usage:
 *   npx tsx src/agent.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { exec } from "node:child_process";

const BASE_URL = "https://agents.karmapay.xyz";
const STATE_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE || ".",
  ".karma-agent.json",
);

function openUrl(url: string): void {
  const platform = process.platform;
  const cmd =
    platform === "darwin" ? "open" : platform === "win32" ? "start" : "xdg-open";
  exec(`${cmd} "${url}"`);
}

// ─── State ───────────────────────────────────────────────────────────────────

interface AgentState {
  email?: string;
  account_id?: string;
  owner_key?: string;
  kyc_status?: string;
  kyc_url?: string;
  card_id?: string;
  agent_key?: string;
  deposit_address?: string;
  card_last4?: string;
  card_name?: string;
}

function loadState(): AgentState {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveState(state: AgentState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function log(msg: string): void {
  console.log(msg);
}

function header(title: string): void {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"─".repeat(60)}\n`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api<T>(
  path: string,
  options: { method?: string; apiKey?: string; body?: unknown } = {},
): Promise<T> {
  const { method = "GET", apiKey, body } = options;
  const headers: Record<string, string> = {};
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `API error ${res.status}`,
    );
  }
  return data as T;
}

// ─── Step 1: Register ────────────────────────────────────────────────────────

async function stepRegister(state: AgentState): Promise<AgentState> {
  if (state.owner_key) {
    log(`Already registered (account: ${state.account_id})`);
    return state;
  }

  header("Step 1: Register");
  const email = await ask("Enter your email: ");

  log("\nRegistering...");
  const res = await api<{
    account_id: string;
    secret_key: string;
    message: string;
  }>("/api/register", {
    method: "POST",
    body: { email },
  });

  state.email = email;
  state.account_id = res.account_id;
  state.owner_key = res.secret_key;
  saveState(state);

  log(`\nAccount created: ${res.account_id}`);
  log(`Owner key: ${res.secret_key}`);
  log(`\n** Save this key — it is shown only once. **`);

  return state;
}

// ─── Step 2: KYC ─────────────────────────────────────────────────────────────

async function stepKyc(state: AgentState): Promise<AgentState> {
  if (state.kyc_status === "approved") {
    log("KYC already approved.");
    return state;
  }

  header("Step 2: KYC Verification");

  // Check if KYC was already submitted
  if (state.kyc_url) {
    log("KYC already submitted. Checking status...");
    return await pollKycStatus(state);
  }

  log("Starting identity verification...\n");
  log("No personal info needed here — you'll verify your identity");
  log("(ID document + selfie) on a secure third-party page.\n");

  log("Requesting verification link...");
  const res = await api<{
    status: string;
    kyc_url: string | null;
  }>("/api/kyc", {
    method: "POST",
    apiKey: state.owner_key,
  });

  state.kyc_status = res.status;
  state.kyc_url = res.kyc_url || undefined;
  saveState(state);

  if (res.status === "approved") {
    log("\nKYC approved instantly!");
    return state;
  }

  if (res.kyc_url) {
    log(`\nOpening verification link in your browser...`);
    log(`  ${res.kyc_url}\n`);
    openUrl(res.kyc_url);
    log(`Complete the identity verification (ID + selfie) in your browser.`);
  }

  return await pollKycStatus(state);
}

async function pollKycStatus(state: AgentState): Promise<AgentState> {
  log("Waiting for KYC approval...");

  if (state.kyc_url) {
    log(`\nVerification link: ${state.kyc_url}`);
    log(`(Opening in browser...)\n`);
    openUrl(state.kyc_url);
  }

  while (true) {
    try {
      const res = await api<{
        status: string;
        kyc_url: string | null;
        reason: string | null;
      }>("/api/kyc/status", {
        apiKey: state.owner_key,
      });

      state.kyc_status = res.status;
      saveState(state);

      if (res.status === "approved") {
        log("\nKYC approved!");
        return state;
      }

      if (res.status === "rejected") {
        log(`\nKYC rejected. Reason: ${res.reason || "unknown"}`);
        process.exit(1);
      }

      process.stdout.write(".");
    } catch {
      process.stdout.write("x");
    }

    await sleep(5000);
  }
}

// ─── Step 3: Create Card ────────────────────────────────────────────────────

async function stepCreateCard(state: AgentState): Promise<AgentState> {
  if (state.agent_key) {
    log(
      `Card already created: **** ${state.card_last4} (${state.card_name})`,
    );
    log(`Deposit address: ${state.deposit_address}`);
    return state;
  }

  header("Step 3: Create Virtual Card");

  const name =
    (await ask("Card name (e.g. Shopping Agent): ")) || "Karma Agent Card";
  const perTxn = await ask("Per-transaction limit in USD (default 100): ");
  const daily = await ask("Daily limit in USD (default 500): ");
  const monthly = await ask("Monthly limit in USD (default 2000): ");

  log("\nCreating card...");
  const res = await api<{
    card_id: string;
    last4: string;
    status: string;
    deposit_address: string;
    agent_api_key: string;
    name: string;
    limits: { per_txn: number; daily: number; monthly: number };
    message: string;
  }>("/api/cards", {
    method: "POST",
    apiKey: state.owner_key,
    body: {
      name,
      per_txn_limit: Number(perTxn) || 100,
      daily_limit: Number(daily) || 500,
      monthly_limit: Number(monthly) || 2000,
    },
  });

  state.card_id = res.card_id;
  state.agent_key = res.agent_api_key;
  state.deposit_address = res.deposit_address;
  state.card_last4 = res.last4;
  state.card_name = res.name;
  saveState(state);

  log(`\nCard created!`);
  log(`  Name:     ${res.name}`);
  log(`  Last 4:   ${res.last4}`);
  log(`  Limits:   $${res.limits.per_txn}/txn, $${res.limits.daily}/day, $${res.limits.monthly}/month`);
  log(`\n  Deposit address (send USDC here):`);
  log(`  ${res.deposit_address}`);
  log(`\n  Agent API key:`);
  log(`  ${res.agent_api_key}`);
  log(`\n** Save the agent key — it is shown only once. **`);

  return state;
}

// ─── Step 4: Wait for Funding ───────────────────────────────────────────────

async function stepWaitForFunding(state: AgentState): Promise<AgentState> {
  header("Step 4: Fund Your Card");

  log(`Send USDC (Solana) to this deposit address:\n`);
  log(`  ${state.deposit_address}\n`);
  log(`USDC Mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`);
  log(`\nWaiting for deposit...`);

  while (true) {
    try {
      const res = await api<{
        available: number;
        balance: number;
        pending_holds: number;
        deposit_address: string;
        daily_remaining: number;
        monthly_remaining: number;
      }>("/api/spend/balance", {
        apiKey: state.agent_key,
      });

      if (res.balance > 0) {
        log(`\n\nBalance detected: $${res.balance.toFixed(2)} USDC`);
        log(`Available to spend: $${res.available.toFixed(2)} USDC`);
        return state;
      }

      process.stdout.write(".");
    } catch {
      process.stdout.write("x");
    }

    await sleep(5000);
  }
}

// ─── Step 5: Operational Mode ───────────────────────────────────────────────

async function operationalMode(state: AgentState): Promise<void> {
  header("Karma Agent — Operational");

  log(`Card: **** ${state.card_last4} (${state.card_name})`);
  log(`Deposit: ${state.deposit_address}\n`);

  while (true) {
    log("\nCommands:");
    log("  [1] Check balance");
    log("  [2] Can I spend $X?");
    log("  [3] Get card details (PAN/CVV)");
    log("  [4] View transactions");
    log("  [5] Exit");

    const choice = await ask("\n> ");

    switch (choice) {
      case "1": {
        const bal = await api<{
          available: number;
          balance: number;
          pending_holds: number;
          daily_remaining: number;
          monthly_remaining: number;
        }>("/api/spend/balance", { apiKey: state.agent_key });

        log(`\n  Balance:     $${bal.balance.toFixed(2)} USDC`);
        log(`  Available:   $${bal.available.toFixed(2)} USDC`);
        log(`  Pending:     $${bal.pending_holds.toFixed(2)} USDC`);
        log(`  Daily left:  $${bal.daily_remaining.toFixed(2)}`);
        log(`  Monthly left: $${bal.monthly_remaining.toFixed(2)}`);
        break;
      }

      case "2": {
        const amountStr = await ask("Amount (USD): ");
        const amount = Number(amountStr);
        if (!amount || amount <= 0) {
          log("Invalid amount.");
          break;
        }

        const check = await api<{
          allowed: boolean;
          amount?: number;
          fees: number;
          total?: number;
          available?: number;
          reason?: string;
        }>("/api/spend/can-spend", {
          method: "POST",
          apiKey: state.agent_key,
          body: { amount, currency: "USD" },
        });

        if (check.allowed) {
          log(`\n  Allowed: YES`);
          log(`  Amount:  $${amount.toFixed(2)}`);
          log(`  Fees:    $${check.fees.toFixed(2)}`);
          log(`  Total:   $${check.total!.toFixed(2)}`);
        } else {
          log(`\n  Allowed: NO`);
          log(`  Reason:  ${check.reason}`);
        }
        break;
      }

      case "3": {
        const card = await api<{
          number: string;
          cvv: string;
          expiry_month: number;
          expiry_year: number;
          expiry: string;
        }>("/api/spend/card", { apiKey: state.agent_key });

        log(`\n  Card:   ${card.number}`);
        log(`  Expiry: ${card.expiry_month}/${card.expiry_year}`);
        log(`  CVV:    ${card.cvv}`);
        break;
      }

      case "4": {
        const res = await api<{ transactions: Array<{
          type: string;
          amount: number;
          currency: string;
          merchant?: string;
          status: string;
          created_at: string;
        }> }>("/api/spend/transactions?limit=10", {
          apiKey: state.agent_key,
        });

        if (res.transactions.length === 0) {
          log("\n  No transactions yet.");
        } else {
          log("");
          for (const tx of res.transactions) {
            const sign = tx.type === "credit" ? "+" : "-";
            const date = new Date(tx.created_at).toLocaleDateString();
            log(
              `  ${sign}$${tx.amount.toFixed(2)} ${tx.currency} — ${tx.merchant || tx.type} (${tx.status}) ${date}`,
            );
          }
        }
        break;
      }

      case "5":
        log("\nGoodbye.");
        rl.close();
        process.exit(0);

      default:
        log("Unknown command. Enter 1-5.");
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
  _  __
 | |/ /__ _ _ __ _ __ ___   __ _
 | ' // _\` | '__| '_ \` _ \\ / _\` |
 | . \\ (_| | |  | | | | | | (_| |
 |_|\\_\\__,_|_|  |_| |_| |_|\\__,_|

  Karma Card: Agentic Credit Cards
  Powered by USDC on Solana
`);

  let state = loadState();

  if (state.agent_key) {
    log(`Resuming with existing card (**** ${state.card_last4})\n`);
    log(`State loaded from ${STATE_FILE}`);
  } else if (state.owner_key) {
    log(`Resuming setup (account: ${state.account_id})\n`);
  } else {
    log("No saved state found. Starting fresh setup.\n");
  }

  try {
    // Setup flow — each step checks if already completed
    state = await stepRegister(state);
    state = await stepKyc(state);
    state = await stepCreateCard(state);
    await stepWaitForFunding(state);

    // Operational mode
    await operationalMode(state);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nError: ${message}`);
    log(`\nState saved to ${STATE_FILE} — run again to resume.`);
    rl.close();
    process.exit(1);
  }
}

main();
