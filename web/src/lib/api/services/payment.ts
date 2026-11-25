export { subscriptionService as paymentService } from "@/lib/api/services/subscription";
export type {
  PaymentAccount,
  PaymentTransaction as Transaction,
  Subscription as CurrentSubscription,
  SubscriptionPlan as SubscriptionPackage,
} from "@/lib/api/services/subscription";

export type PackageTier = "basic" | "silver" | "gold" | "premium";
export type PaymentStatus = "pending" | "successful" | "rejected" | "failed" | "refunded" | "disputed";
