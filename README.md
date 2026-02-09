<p align="center">
  <img src="assets/karma-icon-white.svg" width="120" alt="Karma" />
</p>

<h1 align="center">Karma Agent Cards</h1>

<p align="center">
  <strong>Credit cards for AI agents, backed by USDC on Solana.</strong>
</p>

<p align="center">
  <a href="https://karmapay.xyz">Website</a> &middot;
  <a href="SKILL.md">API Docs</a> &middot;
  <a href="https://agents.karmapay.xyz">API Base URL</a>
</p>

---

## The Problem

AI agents can transfer crypto, but they can't buy things in the real world. They can't pay for APIs with credit cards, subscribe to services, or make purchases on e-commerce sites. There's no safe, isolated payment method designed for autonomous software.

## The Solution

Karma gives every AI agent its own virtual Visa card funded by USDC on Solana.

- **Isolated by design** — each card has its own Solana deposit address, spending limits, and API key
- **Agent gets a scoped key** (`sk_agent_`) — can only check balance, verify spending, and retrieve card details
- **Owner keeps control** (`sk_live_`) — set per-transaction, daily, and monthly limits. Freeze or revoke instantly
- **Funded by USDC** — send USDC to the card's deposit address from any Solana wallet. Balance updates in seconds
- **Real Visa card** — works anywhere Visa is accepted, online and in-person

## How It Works

```
┌─────────────┐     USDC      ┌─────────────────┐     Visa      ┌──────────────┐
│   Solana     │──────────────▸│   Karma Card     │─────────────▸│  Merchant    │
│   Wallet     │               │   (Virtual Visa)  │              │  (Any store) │
└─────────────┘               └─────────────────┘               └──────────────┘
                                       │
                                       │ sk_agent_ key
                                       ▼
                              ┌─────────────────┐
                              │   AI Agent       │
                              │   - Check balance │
                              │   - Verify spend  │
                              │   - Get card PAN  │
                              │   - View history   │
                              └─────────────────┘
```

1. **Owner** registers and completes KYC (one-time)
2. **Owner** creates a card with spending limits → gets a deposit address + agent API key
3. **Owner** funds the card by sending USDC to the deposit address
4. **Agent** uses its `sk_agent_` key to check balance, verify purchases, and retrieve card details
5. **Agent** uses the card number/CVV at checkout — just like a human would
6. **Owner** monitors, adjusts limits, or freezes the card at any time

## Quick Start

### Install

```bash
npm install karma-agent
```

### As an Owner — Create a Card

```typescript
import { KarmaOwner } from "karma-agent";

// Register (one-time)
const { secret_key } = await KarmaOwner.register("you@example.com");

const owner = new KarmaOwner(secret_key);

// Create a card with limits
const card = await owner.createCard({
  name: "Shopping Agent",
  per_txn_limit: 100,
  daily_limit: 500,
  monthly_limit: 2000,
});

console.log(`Deposit address: ${card.deposit_address}`);
console.log(`Agent key: ${card.agent_api_key}`);
// Send USDC to the deposit address, then give the agent key to your AI
```

### As an Agent — Spend

```typescript
import { KarmaAgent } from "karma-agent";

const agent = new KarmaAgent("sk_agent_...");

// Check balance
const balance = await agent.getBalance();
console.log(`Available: $${balance.available}`);

// Can I afford this?
const check = await agent.canSpend(49.99);
if (check.allowed) {
  // Get card details for checkout
  const card = await agent.getCardDetails();
  // Use card.number, card.cvv, card.expiry_month, card.expiry_year
}
```

## Security Model

| Capability | Owner (`sk_live_`) | Agent (`sk_agent_`) |
|---|---|---|
| Create cards | Yes | - |
| Set spending limits | Yes | - |
| Freeze/unfreeze | Yes | - |
| Withdraw USDC | Yes | - |
| Rotate agent key | Yes | - |
| Check balance | Yes | Yes |
| Get card details | - | Yes |
| Verify spend | - | Yes |
| View transactions | - | Yes |

The agent key is scoped to a single card. It cannot create new cards, change limits, withdraw funds, or access other cards. If compromised, the owner can rotate the key instantly.

## API Reference

Full API documentation: **[SKILL.md](SKILL.md)**

### Agent Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/spend/balance` | Check available balance and remaining budget |
| `GET` | `/api/spend/card` | Get card PAN, CVV, expiry for checkout |
| `POST` | `/api/spend/can-spend` | Verify if a purchase is within budget |
| `GET` | `/api/spend/transactions` | Recent transaction history |

### Owner Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/register` | Create account |
| `POST` | `/api/kyc` | Submit KYC |
| `GET` | `/api/kyc/status` | Check KYC status |
| `POST` | `/api/cards` | Create card + agent key |
| `GET` | `/api/cards` | List all cards |
| `PATCH` | `/api/cards/:id` | Update limits |
| `POST` | `/api/cards/:id/freeze` | Freeze card |
| `POST` | `/api/cards/:id/unfreeze` | Unfreeze card |
| `POST` | `/api/cards/:id/withdraw` | Withdraw USDC |
| `POST` | `/api/cards/:id/rotate-key` | Rotate agent key |

## Why Solana?

- **Speed** — USDC deposits confirm in ~400ms. Card is ready to spend instantly.
- **Cost** — Funding a card costs fractions of a cent in transaction fees.
- **USDC native** — The most widely held stablecoin on Solana. No bridging needed.
- **Programmable** — Agents can hold USDC in any Solana wallet and fund cards programmatically.

## Architecture

```
Agent (sk_agent_ key)
  │
  ▼
Karma API (agents.karmapay.xyz)
  │
  ├── Balance: reads on-chain USDC balance via Solana RPC
  ├── Card details: decrypts and returns PAN/CVV
  ├── Can-spend: calculates fees + checks limits
  └── Transactions: returns settlement history
  │
  ▼
Virtual Visa Card (issued by card network partner)
  │
  ▼
Visa Network → Merchant
```

Each card maps to a **dedicated Solana wallet** (the deposit address). The on-chain USDC balance *is* the card balance — no separate ledger, no custodial pool. What you see on-chain is what the card can spend.

## Built By

**[Karma](https://karmapay.xyz)** — Crypto neobanking for everyone. Mobile app on iOS and Android.

Follow us: [@karmawallet](https://x.com/karmawallet)

## License

MIT
