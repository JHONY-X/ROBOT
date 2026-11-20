import { randomUUID } from "node:crypto";

export type DemoRole = "candidate" | "employer" | "admin";
export type AccountStatus =
  | "Awaiting email verification"
  | "Pending admin approval"
  | "Pending payment"
  | "Payment submitted"
  | "Approved"
  | "Rejected";
export type EmployerPaymentStatus = "Pending" | "Approved" | "Rejected";

export interface DemoSubscriptionPackage {
  name: string;
  amount: number;
  annualTraineeCapacity: number | null;
  discountPercent: number;
  costPerTrainee: number;
  durationMonths: number;
  description: string;
  active: boolean;
}

export interface DemoCandidateAccount {
  id: string;
  firstName: string;
  secondName: string;
  email: string;
  phone: string;
  passwordSalt: string;
  passwordHash: string;
  invitationId: string;
  emailVerified: boolean;
  status: AccountStatus;
  createdAt: string;
}

export interface DemoEmployerAccount {
  id: string;
  organizationName: string;
  organizationType: string;
  city: string;
  subcity: string;
  hrEmail: string;
  organizationPhone: string;
  representativeEmail: string;
  representativePhone: string;
  businessLicenseFileName: string;
  businessLicenseDataUrl: string;
  passwordSalt: string;
  passwordHash: string;
  emailVerified: boolean;
  status: AccountStatus;
  createdAt: string;
  selectedPackage?: string;
  subscription?: {
    startsAt: string;
    endsAt: string;
    traineesUsed: number;
  };
  payment?: {
    method: string;
    transactionId: string;
    receiptUrl: string;
    proofFileName?: string;
    proofDataUrl?: string;
    submittedAt: string;
    status: EmployerPaymentStatus;
    reviewNote?: string;
  };
}

export interface DemoInvitation {
  id: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  revokedAt?: string;
}

export interface DemoOtp {
  id: string;
  role: "candidate" | "employer";
  accountId: string;
  email: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  consumedAt?: string;
  attempts: number;
}

export interface DemoSession {
  id: string;
  role: "candidate" | "employer";
  accountId: string;
}

export interface DemoStore {
  invitations: Map<string, DemoInvitation>;
  candidates: Map<string, DemoCandidateAccount>;
  employers: Map<string, DemoEmployerAccount>;
  otps: Map<string, DemoOtp>;
  sessions: Map<string, DemoSession>;
  subscriptionPackages: Map<string, DemoSubscriptionPackage>;
}

const globalDemoStore = globalThis as typeof globalThis & {
  rohobotDemoWorkflowStore?: DemoStore;
};

export const demoStore =
  globalDemoStore.rohobotDemoWorkflowStore ??
  (globalDemoStore.rohobotDemoWorkflowStore = {
    invitations: new Map(),
    candidates: new Map(),
    employers: new Map(),
    otps: new Map(),
    sessions: new Map(),
    subscriptionPackages: new Map<string, DemoSubscriptionPackage>([
      ["Basic", { name: "Basic", amount: 136575, annualTraineeCapacity: 50, discountPercent: 10, costPerTrainee: 2731.5, durationMonths: 12, description: "Annual hospital training and job matching", active: true }],
      ["Silver", { name: "Silver", amount: 386962.5, annualTraineeCapacity: 150, discountPercent: 15, costPerTrainee: 2579.75, durationMonths: 12, description: "Annual hospital training and job matching", active: true }],
      ["Gold", { name: "Gold", amount: 1214000, annualTraineeCapacity: 500, discountPercent: 20, costPerTrainee: 2428, durationMonths: 12, description: "Annual hospital training and job matching", active: true }],
      ["Premium", { name: "Premium", amount: 2276.25, annualTraineeCapacity: null, discountPercent: 25, costPerTrainee: 2276.25, durationMonths: 12, description: "Unlimited annual training capacity; charged per trainee", active: true }],
    ]),
  });

export function newDemoId(): string {
  return randomUUID();
}

export function normalizeDemoEmail(email: string): string {
  return email.trim().toLowerCase();
}
