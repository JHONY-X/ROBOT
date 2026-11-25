import { normalizeApiErrors, firstApiError, type NormalizedApiErrors } from "@/lib/api/errors";

export class SubscriptionApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly data?: unknown, public readonly errors: NormalizedApiErrors = normalizeApiErrors(data)) {
    super(message);
    this.name = "SubscriptionApiError";
  }
}

export type SubscriptionPlan = {
  id: number;
  name: "basic" | "silver" | "gold" | "premium";
  description: string;
  price: number | string;
  duration_days: number;
  hiring_limit: number;
  interview_request_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PaymentAccount = {
  id: number;
  account_type: "bank" | "telebirr";
  provider_name: string;
  account_identifier: string;
  account_holder_name: string;
  instructions: string;
};

export type PaymentTransaction = {
  id: number;
  subscription: number;
  provider: "manual" | "chapa";
  payment_method: "telebirr" | "bank_transfer" | "other";
  payment_account: number;
  payment_account_name: string;
  account_identifier_snapshot: string;
  account_holder_snapshot: string;
  amount: number | string;
  status: "pending" | "successful" | "rejected" | "failed" | "refunded" | "disputed";
  transaction_reference: string;
  receipt_url: string;
  payment_date: string;
  provider_reference: string | null;
  checkout_url: string;
  verified_by: number | null;
  payment_verified_at: string | null;
  rejection_reason: string;
  failure_reason: string;
  created_at: string;
  updated_at: string;
};

export type SubscriptionHistoryEntry = {
  id: number;
  action: string;
  previous_plan: number | null;
  new_plan: number | null;
  description: string;
  performed_by: number | null;
  performed_by_email: string | null;
  created_at: string;
};

export type Subscription = {
  id: number;
  organization: number;
  organization_name: string;
  plan: number;
  plan_name: string;
  price_snapshot: number | string;
  duration_days_snapshot: number;
  status: "pending" | "active" | "rejected" | "expired" | "cancelled" | "suspended";
  start_date: string | null;
  end_date: string | null;
  history: SubscriptionHistoryEntry[];
  payment_transactions: PaymentTransaction[];
  created_at: string;
  updated_at: string;
};

async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/api/subscriptions/${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await response.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new SubscriptionApiError(response.status, firstApiError(data, "The subscription request failed."), data);
  return data as T;
}

export const subscriptionService = {
  listPlans: () => request<SubscriptionPlan[]>("plans/"),
  getPlan: (id: number) => request<SubscriptionPlan>(`plans/${id}/`),
  createPlan: (input: Omit<SubscriptionPlan, "id" | "created_at" | "updated_at">) => request<SubscriptionPlan>("plans/", "POST", input),
  updatePlan: (id: number, input: Partial<Omit<SubscriptionPlan, "id" | "created_at" | "updated_at">>) => request<SubscriptionPlan>(`plans/${id}/`, "PATCH", input),
  deletePlan: (id: number) => request<{ message?: string; error?: string }>(`plans/${id}/`, "DELETE"),
  listPaymentAccounts: () => request<PaymentAccount[]>("payment-accounts/"),
  listPayments: () => request<PaymentTransaction[]>("payments/"),
  submitPayment: (input: { plan_id: number; payment_account: number; payment_method: "bank_transfer" | "telebirr"; transaction_reference: string; receipt_url: string }) => request<{ detail: string; subscription: Subscription; payment: PaymentTransaction }>("payments/", "POST", input),
  currentSubscriptions: () => request<Subscription[]>(""),
  getSubscription: (id: number) => request<Subscription>(`${id}/`),
  listAdminPaymentAccounts: () => request<PaymentAccount[]>("admin/payment-accounts/"),
  createAdminPaymentAccount: (input: Omit<PaymentAccount, "id">) => request<PaymentAccount>("admin/payment-accounts/", "POST", input),
  getAdminPaymentAccount: (id: number) => request<PaymentAccount>(`admin/payment-accounts/${id}/`),
  updateAdminPaymentAccount: (id: number, input: Partial<Omit<PaymentAccount, "id">>) => request<PaymentAccount>(`admin/payment-accounts/${id}/`, "PATCH", input),
  deleteAdminPaymentAccount: (id: number) => request<{ detail?: string }>(`admin/payment-accounts/${id}/`, "DELETE"),
  listPendingPayments: () => request<PaymentTransaction[]>("admin/payments/pending/"),
  approvePayment: (id: number, verification_note = "") => request<{ detail: string; payment: PaymentTransaction; subscription: Subscription }>(`admin/payments/${id}/approve/`, "POST", { verification_note }),
  rejectPayment: (id: number, rejection_reason: string) => request<{ detail: string; payment: PaymentTransaction; subscription: Subscription }>(`admin/payments/${id}/reject/`, "POST", { rejection_reason }),
};
