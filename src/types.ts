/** Karma Agent API type definitions */

export interface RegisterRequest {
  email: string;
}

export interface RegisterResponse {
  account_id: string;
  secret_key: string;
}

export interface KycRequest {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  nationalId: string;
  countryOfIssue: string;
  phoneCountryCode: string;
  phoneNumber: string;
  address: {
    line1: string;
    city: string;
    region: string;
    postalCode: string;
    countryCode: string;
  };
  ipAddress: string;
}

export interface KycResponse {
  status: string;
  kyc_url?: string;
}

export interface KycStatusResponse {
  status: string;
  kyc_url?: string;
}

export interface CreateCardRequest {
  name: string;
  per_txn_limit?: number;
  daily_limit?: number;
  monthly_limit?: number;
}

export interface CreateCardResponse {
  card_id: string;
  agent_api_key: string;
  deposit_address: string;
  last4: string;
}

export interface Card {
  card_id: string;
  name: string;
  last4: string;
  deposit_address: string;
  balance: number;
  frozen: boolean;
  per_txn_limit: number;
  daily_limit: number;
  monthly_limit: number;
}

export interface BalanceResponse {
  available: number;
  balance: number;
  pending_holds: number;
  deposit_address: string;
  daily_remaining: number;
  monthly_remaining: number;
}

export interface CardDetailsResponse {
  number: string;
  cvv: string;
  expiry: string;
  expiry_month: string;
  expiry_year: string;
}

export interface CanSpendRequest {
  amount: number;
  currency?: string;
}

export interface CanSpendResponse {
  allowed: boolean;
  fees: number;
  total: number;
  available: number;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  merchant?: string;
  status: string;
  created_at: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
}

export interface UpdateCardRequest {
  name?: string;
  per_txn_limit?: number;
  daily_limit?: number;
  monthly_limit?: number;
}

export interface WithdrawRequest {
  address: string;
  amount: number;
}

export interface WithdrawResponse {
  signature: string;
  amount: number;
}

export interface RotateKeyResponse {
  agent_api_key: string;
}

export type ApiError = {
  error: string;
  details?: string;
};
