import type {
  RegisterRequest,
  RegisterResponse,
  KycRequest,
  KycResponse,
  KycStatusResponse,
  CreateCardRequest,
  CreateCardResponse,
  Card,
  BalanceResponse,
  CardDetailsResponse,
  CanSpendRequest,
  CanSpendResponse,
  TransactionsResponse,
  UpdateCardRequest,
  WithdrawRequest,
  WithdrawResponse,
  RotateKeyResponse,
} from "./types.js";

const BASE_URL = "https://agents.karmapay.xyz";

class KarmaApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Karma API error ${status}: ${JSON.stringify(body)}`);
    this.name = "KarmaApiError";
  }
}

async function request<T>(
  path: string,
  options: {
    method?: string;
    apiKey?: string;
    body?: unknown;
  } = {},
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
  if (!res.ok) throw new KarmaApiError(res.status, data);
  return data as T;
}

/**
 * Owner client — uses an `sk_live_` key.
 * Full access: register, KYC, create/manage cards, withdraw funds.
 */
export class KarmaOwner {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey.startsWith("sk_live_")) {
      throw new Error("KarmaOwner requires an sk_live_ key");
    }
    this.apiKey = apiKey;
  }

  /** Register a new account. Returns the owner API key (shown once). */
  static async register(email: string): Promise<RegisterResponse> {
    return request<RegisterResponse>("/api/register", {
      method: "POST",
      body: { email } satisfies RegisterRequest,
    });
  }

  /** Submit KYC application. Returns status and optional approval URL. */
  async submitKyc(data: KycRequest): Promise<KycResponse> {
    return request<KycResponse>("/api/kyc", {
      method: "POST",
      apiKey: this.apiKey,
      body: data,
    });
  }

  /** Check KYC approval status. */
  async getKycStatus(): Promise<KycStatusResponse> {
    return request<KycStatusResponse>("/api/kyc/status", {
      apiKey: this.apiKey,
    });
  }

  /** Create a new virtual card. Returns card details + agent API key. */
  async createCard(data: CreateCardRequest): Promise<CreateCardResponse> {
    return request<CreateCardResponse>("/api/cards", {
      method: "POST",
      apiKey: this.apiKey,
      body: data,
    });
  }

  /** List all cards on this account. */
  async listCards(): Promise<Card[]> {
    return request<Card[]>("/api/cards", {
      apiKey: this.apiKey,
    });
  }

  /** Update card name or spending limits. */
  async updateCard(cardId: string, data: UpdateCardRequest): Promise<Card> {
    return request<Card>(`/api/cards/${cardId}`, {
      method: "PATCH",
      apiKey: this.apiKey,
      body: data,
    });
  }

  /** Freeze a card — blocks all spending. */
  async freezeCard(cardId: string): Promise<void> {
    await request(`/api/cards/${cardId}/freeze`, {
      method: "POST",
      apiKey: this.apiKey,
    });
  }

  /** Unfreeze a card — restores spending. */
  async unfreezeCard(cardId: string): Promise<void> {
    await request(`/api/cards/${cardId}/unfreeze`, {
      method: "POST",
      apiKey: this.apiKey,
    });
  }

  /** Withdraw USDC from a card to an external Solana wallet. */
  async withdraw(
    cardId: string,
    data: WithdrawRequest,
  ): Promise<WithdrawResponse> {
    return request<WithdrawResponse>(`/api/cards/${cardId}/withdraw`, {
      method: "POST",
      apiKey: this.apiKey,
      body: data,
    });
  }

  /** Revoke the current agent key and issue a new one. */
  async rotateAgentKey(cardId: string): Promise<RotateKeyResponse> {
    return request<RotateKeyResponse>(`/api/cards/${cardId}/rotate-key`, {
      method: "POST",
      apiKey: this.apiKey,
    });
  }
}

/**
 * Agent client — uses an `sk_agent_` key.
 * Scoped to one card. Can check balance, get card details, and verify spend.
 */
export class KarmaAgent {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey.startsWith("sk_agent_")) {
      throw new Error("KarmaAgent requires an sk_agent_ key");
    }
    this.apiKey = apiKey;
  }

  /** Check available balance, pending holds, and remaining budget. */
  async getBalance(): Promise<BalanceResponse> {
    return request<BalanceResponse>("/api/spend/balance", {
      apiKey: this.apiKey,
    });
  }

  /** Get full card details (PAN, CVV, expiry) for checkout. */
  async getCardDetails(): Promise<CardDetailsResponse> {
    return request<CardDetailsResponse>("/api/spend/card", {
      apiKey: this.apiKey,
    });
  }

  /** Check if a purchase amount is within budget. Includes fee calculation. */
  async canSpend(
    amount: number,
    currency = "USD",
  ): Promise<CanSpendResponse> {
    return request<CanSpendResponse>("/api/spend/can-spend", {
      method: "POST",
      apiKey: this.apiKey,
      body: { amount, currency } satisfies CanSpendRequest,
    });
  }

  /** Get recent transaction history. */
  async getTransactions(limit = 20): Promise<TransactionsResponse> {
    return request<TransactionsResponse>(
      `/api/spend/transactions?limit=${limit}`,
      { apiKey: this.apiKey },
    );
  }
}
