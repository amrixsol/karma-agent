# Karma Agent Cards

> Give your AI agent a credit card on Solana.

Base URL: `https://agents.karmapay.xyz`

## What is this?

Karma lets you create virtual credit cards funded by USDC on Solana. Each card gets its own deposit address. Send USDC, agent spends with the card. Withdraw anytime.

## Quick Start

```bash
# 1. Register
curl -X POST https://agents.karmapay.xyz/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
# Returns: { account_id, secret_key: "sk_live_..." }

# 2. Complete KYC (one-time, human step — no PII needed)
curl -X POST https://agents.karmapay.xyz/api/kyc \
  -H "Authorization: Bearer sk_live_..."
# Returns: { status: "pending_verification", kyc_url: "https://in.sumsub.com/..." }
# Human opens kyc_url in browser to verify identity (ID + selfie on Sumsub's secure site).
# Agent polls GET /api/kyc/status until status is "approved".

# 3. Create a card for your agent
curl -X POST https://agents.karmapay.xyz/api/cards \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"name":"Shopping Agent","per_txn_limit":500}'
# Returns: { card_id, agent_api_key: "sk_agent_...", deposit_address, last4 }

# 4. Fund it — send USDC to the deposit_address from any Solana wallet

# 5. Give your agent the sk_agent key. It can now:
```

## Agent Endpoints (sk_agent key)

### Check balance
```
GET /api/spend/balance
Authorization: Bearer sk_agent_...
```
Returns: `{ available, balance, deposit_address, daily_remaining, monthly_remaining }`

### Get card details for checkout
```
GET /api/spend/card
Authorization: Bearer sk_agent_...
```
Returns: `{ number, cvv, expiry, expiry_month, expiry_year }`

### Can I afford this?
```
POST /api/spend/can-spend
Authorization: Bearer sk_agent_...
Content-Type: application/json

{"amount": 49.99, "currency": "USD"}
```
Returns: `{ allowed: true/false, fees, total, available }`

### Transaction history
```
GET /api/spend/transactions?limit=20
Authorization: Bearer sk_agent_...
```

## Owner Endpoints (sk_live key)

### List cards
```
GET /api/cards
Authorization: Bearer sk_live_...
```

### Update card limits
```
PATCH /api/cards/:id
Authorization: Bearer sk_live_...
Content-Type: application/json

{"name": "New Name", "per_txn_limit": 200, "daily_limit": 1000}
```

### Freeze / Unfreeze
```
POST /api/cards/:id/freeze
POST /api/cards/:id/unfreeze
Authorization: Bearer sk_live_...
```

### Withdraw USDC
```
POST /api/cards/:id/withdraw
Authorization: Bearer sk_live_...
Content-Type: application/json

{"address": "So1anaWa11etAddress...", "amount": 100}
```

### Rotate agent key
```
POST /api/cards/:id/rotate-key
Authorization: Bearer sk_live_...
```

## Fees

- Service fee: $0.15 + 0.1% per transaction (max $5)
- Foreign transaction: $0.30 (non-USD)
- ATM: $1.00 + 0.65%

## How Funding Works

1. Each card has a unique Solana deposit address
2. Send USDC (SPL token) to that address
3. Balance updates automatically via webhook
4. Card is ready to spend within seconds

USDC Mint: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

## Auth

Two API key types:
- `sk_live_...` — Owner key. Full access: create cards, set limits, freeze, withdraw.
- `sk_agent_...` — Agent key. Read-only + spend: check balance, get card details, verify budget.

Keys are shown once at creation. Store them securely.
