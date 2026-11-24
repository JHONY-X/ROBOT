import {
  createHash,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import {
  demoStore,
  newDemoId,
  normalizeDemoEmail,
  type DemoCandidateAccount,
  type DemoEmployerAccount,
  type DemoSession,
} from "./store";

const INVITATION_LIFETIME_MS = 72 * 60 * 60 * 1000;
const OTP_LIFETIME_MS = 10 * 60 * 1000;
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_HASH_BYTES = 64;

export type InvitationStatus = "Pending" | "Used" | "Expired" | "Revoked";

export interface DemoInvitationSummary {
  id: string;
  createdAt: string;
  expiresAt: string;
  status: InvitationStatus;
}

export type CandidateRegistrationInput = {
  firstName: string;
  secondName: string;
  email: string;
  phone: string;
  password: string;
};

export type EmployerRegistrationInput = {
  hrFirstName: string;
  hrMiddleName: string;
  hrLastName: string;
  organizationEmail: string;
  organizationPhone: string;
  password: string;
};

export type EmployerProfileInput = {
  organizationName: string;
  organizationType: string;
  city: string;
  subcity: string;
  organizationPhone: string;
  representativePhone: string;
  businessLicenseFileName: string;
  businessLicenseDataUrl: string;
};

export interface DemoReviewQueue {
  otps: {
    id: string;
    role: "candidate" | "employer";
    email: string;
    code: string;
    createdAt: string;
    expiresAt: string;
  }[];
  candidates: {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
    status: string;
  }[];
  employers: {
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
    createdAt: string;
  }[];
  payments: {
    employerId: string;
    organizationName: string;
    packageName: string;
    amount: number;
    method: string;
    transactionId: string;
    proofFileName: string;
    proofDataUrl: string;
    receiptUrl: string;
    submittedAt: string;
  }[];
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function passwordDigest(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, PASSWORD_HASH_BYTES);
}

function isValidPassword(password: string): boolean {
  return password.length >= 12 && password.length <= 128;
}

function accountExists(email: string): boolean {
  const normalizedEmail = normalizeDemoEmail(email);
  return (
    demoStore.candidates.has(normalizedEmail) ||
    [...demoStore.employers.values()].some(
      (employer) =>
        normalizeDemoEmail(employer.representativeEmail) === normalizedEmail ||
        normalizeDemoEmail(employer.hrEmail) === normalizedEmail
    )
  );
}

function invitationStatus(
  invitation: (typeof demoStore.invitations extends Map<string, infer T> ? T : never)
): InvitationStatus {
  if (invitation.revokedAt) return "Revoked";
  if (invitation.usedAt) return "Used";
  if (Date.parse(invitation.expiresAt) <= Date.now()) return "Expired";
  return "Pending";
}

export function createDemoInvitation(): { invitation: DemoInvitationSummary; token: string } {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const invitation = {
    id: newDemoId(),
    tokenHash: hash(token),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + INVITATION_LIFETIME_MS).toISOString(),
  };
  demoStore.invitations.set(invitation.id, invitation);
  return {
    invitation: { ...invitation, status: "Pending" },
    token,
  };
}

export function listDemoInvitations(): DemoInvitationSummary[] {
  return [...demoStore.invitations.values()]
    .map(({ id, createdAt, expiresAt, ...invitation }) => ({
      id,
      createdAt,
      expiresAt,
      status: invitationStatus({ id, createdAt, expiresAt, ...invitation }),
    }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function revokeDemoInvitation(id: string): boolean {
  const invitation = demoStore.invitations.get(id);
  if (!invitation || invitationStatus(invitation) !== "Pending") return false;
  invitation.revokedAt = new Date().toISOString();
  return true;
}

function findInvitation(token: string) {
  if (!token || token.length > 200) return undefined;
  const tokenHash = hash(token);
  return [...demoStore.invitations.values()].find((invitation) =>
    timingSafeEqual(Buffer.from(invitation.tokenHash), Buffer.from(tokenHash))
  );
}

export function inspectDemoInvitation(token: string): {
  valid: boolean;
  message: string;
} {
  const invitation = findInvitation(token);
  if (!invitation) return { valid: false, message: "This invitation link is invalid." };

  const status = invitationStatus(invitation);
  if (status !== "Pending") {
    const messages: Record<Exclude<InvitationStatus, "Pending">, string> = {
      Used: "This invitation has already been used.",
      Expired: "This invitation has expired. Ask a Rohobot official for a new link.",
      Revoked: "This invitation has been revoked. Ask a Rohobot official for help.",
    };
    return { valid: false, message: messages[status] };
  }
  return { valid: true, message: "Invitation is valid." };
}

function accountByEmail(email: string) {
  const normalizedEmail = normalizeDemoEmail(email);
  const candidate = demoStore.candidates.get(normalizedEmail);
  if (candidate) return { role: "candidate" as const, account: candidate };

  const employer = [...demoStore.employers.values()].find(
    (item) => normalizeDemoEmail(item.representativeEmail) === normalizedEmail
  );
  return employer ? { role: "employer" as const, account: employer } : null;
}

export function registerDemoCandidate(
  token: string,
  input: CandidateRegistrationInput
): { success: boolean; message: string } {
  const invitation = findInvitation(token);
  if (!invitation || invitationStatus(invitation) !== "Pending") {
    return { success: false, message: inspectDemoInvitation(token).message };
  }

  const firstName = input.firstName.trim();
  const secondName = input.secondName.trim();
  const email = normalizeDemoEmail(input.email);
  const phone = input.phone.trim();
  if (
    !firstName ||
    !secondName ||
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !phone ||
    phone.length > 30
  ) {
    return { success: false, message: "Enter valid names, email, and phone number." };
  }
  if (!isValidPassword(input.password)) {
    return { success: false, message: "Use a password between 12 and 128 characters." };
  }
  if (accountExists(email)) {
    return { success: false, message: "This email address is already registered." };
  }

  const salt = randomBytes(PASSWORD_SALT_BYTES);
  const account: DemoCandidateAccount = {
    id: newDemoId(),
    firstName,
    secondName,
    email,
    phone,
    passwordSalt: salt.toString("hex"),
    passwordHash: passwordDigest(input.password, salt).toString("hex"),
    invitationId: invitation.id,
    emailVerified: false,
    status: "Awaiting email verification",
    createdAt: new Date().toISOString(),
  };
  demoStore.candidates.set(email, account);
  invitation.usedAt = account.createdAt;
  issueDemoOtp("candidate", account);
  return { success: true, message: "Registration saved. Verify your email to continue." };
}

export function registerDemoEmployer(
  input: EmployerRegistrationInput
): { success: boolean; message: string } {
  const email = normalizeDemoEmail(input.organizationEmail);
  if (
    input.hrFirstName.trim().length > 100 ||
    input.hrMiddleName.trim().length > 100 ||
    input.hrLastName.trim().length > 100 ||
    email.length > 254 ||
    !input.hrFirstName.trim() ||
    !input.hrMiddleName.trim() ||
    !input.hrLastName.trim() ||
    !input.organizationPhone.trim() ||
    input.organizationPhone.trim().length > 30 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return { success: false, message: "Enter the HR contact's full name, a valid organization email, and organization phone." };
  }
  if (!isValidPassword(input.password)) {
    return { success: false, message: "Use a password between 12 and 128 characters." };
  }
  if (accountExists(email)) {
    return { success: false, message: "This organization email is already registered." };
  }

  const salt = randomBytes(PASSWORD_SALT_BYTES);
  const account: DemoEmployerAccount = {
    id: newDemoId(),
    hrFirstName: input.hrFirstName.trim(),
    hrMiddleName: input.hrMiddleName.trim(),
    hrLastName: input.hrLastName.trim(),
    organizationName: "",
    organizationType: "",
    city: "",
    subcity: "",
    hrEmail: email,
    organizationPhone: input.organizationPhone.trim(),
    representativeEmail: email,
    representativePhone: "",
    businessLicenseFileName: "",
    businessLicenseDataUrl: "",
    passwordSalt: salt.toString("hex"),
    passwordHash: passwordDigest(input.password, salt).toString("hex"),
    emailVerified: false,
    status: "Awaiting email verification",
    createdAt: new Date().toISOString(),
  };
  demoStore.employers.set(account.id, account);
  issueDemoOtp("employer", account);
  return { success: true, message: "Organization account created. Verify the organization email before completing its profile." };
}

export function getDemoEmployerProfile(sessionId: string) {
  const session = demoStore.sessions.get(sessionId);
  const employer = session?.role === "employer" ? demoStore.employers.get(session.accountId) : undefined;
  if (!employer) return undefined;
  return {
    hrFirstName: employer.hrFirstName,
    hrMiddleName: employer.hrMiddleName,
    hrLastName: employer.hrLastName,
    organizationEmail: employer.representativeEmail,
    emailVerified: employer.emailVerified,
    organizationName: employer.organizationName,
    organizationType: employer.organizationType,
    city: employer.city,
    subcity: employer.subcity,
    organizationPhone: employer.organizationPhone,
    representativePhone: employer.representativePhone,
    businessLicenseFileName: employer.businessLicenseFileName,
    status: employer.status,
  };
}

export function updateDemoEmployerProfile(
  sessionId: string,
  input: EmployerProfileInput
): { success: boolean; message: string } {
  const session = demoStore.sessions.get(sessionId);
  const employer = session?.role === "employer" ? demoStore.employers.get(session.accountId) : undefined;
  if (!employer || !employer.emailVerified) {
    return { success: false, message: "Verify the organization email before updating the profile." };
  }
  if (
    !input.organizationName.trim() ||
    !input.organizationType.trim() ||
    !input.city.trim() ||
    !input.subcity.trim() ||
    !input.organizationPhone.trim() ||
    !input.representativePhone.trim()
  ) {
    return { success: false, message: "Complete all organization profile fields." };
  }
  if (
    (input.businessLicenseFileName && !input.businessLicenseDataUrl) ||
    (!input.businessLicenseFileName && !employer.businessLicenseFileName) ||
    (input.businessLicenseDataUrl &&
      (input.businessLicenseDataUrl.length > 2_800_000 ||
        !/^data:(application\/pdf|image\/(png|jpeg|webp));base64,/.test(input.businessLicenseDataUrl)))
  ) {
    return { success: false, message: "Attach a PDF or image business license up to 2 MB." };
  }

  employer.organizationName = input.organizationName.trim();
  employer.organizationType = input.organizationType.trim();
  employer.city = input.city.trim();
  employer.subcity = input.subcity.trim();
  employer.organizationPhone = input.organizationPhone.trim();
  employer.representativePhone = input.representativePhone.trim();
  if (input.businessLicenseFileName && input.businessLicenseDataUrl) {
    employer.businessLicenseFileName = input.businessLicenseFileName;
    employer.businessLicenseDataUrl = input.businessLicenseDataUrl;
  }
  if (employer.status === "Profile incomplete") employer.status = "Pending payment";
  return { success: true, message: "Organization profile saved." };
}

function issueDemoOtp(role: "candidate" | "employer", account: DemoCandidateAccount | DemoEmployerAccount) {
  const otp = [...demoStore.otps.values()].find(
    (item) => item.accountId === account.id && !item.consumedAt && Date.parse(item.expiresAt) > Date.now()
  );
  if (otp) return otp;

  const email = role === "candidate"
    ? (account as DemoCandidateAccount).email
    : (account as DemoEmployerAccount).representativeEmail;
  const now = Date.now();
  const item = {
    id: newDemoId(),
    role,
    accountId: account.id,
    email,
    code: randomInt(100_000, 1_000_000).toString(),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + OTP_LIFETIME_MS).toISOString(),
    attempts: 0,
  };
  demoStore.otps.set(item.id, item);
  return item;
}

export function requestDemoEmailOtp(role: "candidate" | "employer", email: string): boolean {
  const result = accountByEmail(email);
  if (!result || result.role !== role || result.account.emailVerified) return false;
  if (role === "employer" && result.account.status !== "Awaiting email verification") return false;
  issueDemoOtp(role, result.account);
  return true;
}

export function verifyDemoEmailOtp(
  role: "candidate" | "employer",
  email: string,
  code: string
): { success: boolean; message: string } {
  const result = accountByEmail(email);
  if (!result || result.role !== role) {
    return { success: false, message: "The verification request could not be found." };
  }
  if (result.account.emailVerified) {
    return { success: true, message: "Email is already verified." };
  }

  const otp = [...demoStore.otps.values()]
    .filter((item) => item.accountId === result.account.id && !item.consumedAt)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  if (!otp || Date.parse(otp.expiresAt) <= Date.now()) {
    return { success: false, message: "The code expired. Request a new code from the admin demo inbox." };
  }
  otp.attempts += 1;
  if (otp.attempts > 5) {
    return { success: false, message: "Too many attempts. Request a new code." };
  }
  if (otp.code !== code) return { success: false, message: "That verification code is incorrect." };

  otp.consumedAt = new Date().toISOString();
  result.account.emailVerified = true;
  result.account.status =
    role === "candidate" ? "Pending admin approval" : "Profile incomplete";
  return {
    success: true,
    message:
      role === "candidate"
        ? "Email verified. Your candidate account is waiting for admin approval."
        : "Organization email verified. Sign in to complete the organization profile.",
  };
}

export function authenticateDemoAccount(email: string, password: string) {
  const normalizedEmail = normalizeDemoEmail(email);
  const defaultAdminEmail = normalizeDemoEmail(process.env.ADMIN_EMAIL || "admin@rohobot.com");
  const defaultAdminPass = process.env.ADMIN_PASSWORD || "AdminPass123!";

  if (normalizedEmail === defaultAdminEmail && password === defaultAdminPass) {
    const session: DemoSession = {
      id: newDemoId(),
      role: "admin",
      accountId: "admin-root",
    };
    demoStore.sessions.set(session.id, session);
    return {
      sessionId: session.id,
      role: "admin" as const,
      name: "Rohobot Administrator",
      status: "Approved",
    };
  }

  const result = accountByEmail(email);
  if (!result || !result.account.emailVerified || password.length > 128) return null;

  const account = result.account;
  const salt = Buffer.from(account.passwordSalt, "hex");
  const expectedHash = Buffer.from(account.passwordHash, "hex");
  const suppliedHash = passwordDigest(password, salt);
  if (!timingSafeEqual(expectedHash, suppliedHash)) return null;
  if (account.status === "Rejected" || account.status === "Awaiting email verification") return null;

  const session: DemoSession = {
    id: newDemoId(),
    role: result.role,
    accountId: account.id,
  };
  demoStore.sessions.set(session.id, session);

  const name = result.role === "candidate"
    ? `${(account as DemoCandidateAccount).firstName} ${(account as DemoCandidateAccount).secondName}`
    : ((account as DemoEmployerAccount).organizationName ||
      `${(account as DemoEmployerAccount).hrFirstName} ${(account as DemoEmployerAccount).hrMiddleName} ${(account as DemoEmployerAccount).hrLastName}`);

  return {
    sessionId: session.id,
    role: result.role,
    name,
    status: account.status,
  };
}

export function getDemoSession(sessionId: string) {
  return demoStore.sessions.get(sessionId);
}

export function getDemoSessionIdentity(sessionId: string) {
  const session = demoStore.sessions.get(sessionId);
  if (!session) return undefined;
  if (session.role === "admin") {
    return {
      id: "admin-root",
      role: "admin" as const,
      name: "Rohobot Administrator",
      email: process.env.ADMIN_EMAIL || "admin@rohobot.com",
      phone: "",
      status: "Approved",
    };
  }
  if (session.role === "candidate") {
    const account = [...demoStore.candidates.values()].find((item) => item.id === session.accountId);
    if (!account) return undefined;
    return {
      id: account.id,
      role: "candidate" as const,
      name: `${account.firstName} ${account.secondName}`,
      email: account.email,
      phone: account.phone,
      status: account.status,
    };
  }
  const account = demoStore.employers.get(session.accountId);
  return account
    ? {
        id: account.id,
        role: "employer" as const,
        name: account.organizationName ||
          `${account.hrFirstName} ${account.hrMiddleName} ${account.hrLastName}`,
        email: account.representativeEmail,
        phone: account.representativePhone,
        status: account.status,
      }
    : undefined;
}

export function revokeDemoSession(sessionId: string): void {
  demoStore.sessions.delete(sessionId);
}

export function listDemoReviewQueue(): DemoReviewQueue {
  const packageAmount = (packageName: string | undefined) =>
    demoStore.subscriptionPackages.get(packageName ?? "")?.amount ?? 0;

  return {
    otps: [...demoStore.otps.values()]
      .filter((otp) => !otp.consumedAt && Date.parse(otp.expiresAt) > Date.now())
      .map(({ id, role, email, code, createdAt, expiresAt }) => ({
        id,
        role,
        email,
        code,
        createdAt,
        expiresAt,
      }))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    candidates: [...demoStore.candidates.values()]
      .filter((candidate) => candidate.emailVerified && candidate.status === "Pending admin approval")
      .map((candidate) => ({
        id: candidate.id,
        name: `${candidate.firstName} ${candidate.secondName}`,
        email: candidate.email,
        phone: candidate.phone,
        createdAt: candidate.createdAt,
        status: candidate.status,
      })),
    employers: [...demoStore.employers.values()]
      .filter((employer) => employer.emailVerified && employer.organizationName)
      .map((employer) => ({
        id: employer.id,
        organizationName: employer.organizationName,
        organizationType: employer.organizationType,
        city: employer.city,
        subcity: employer.subcity,
        hrEmail: employer.hrEmail,
        organizationPhone: employer.organizationPhone,
        representativeEmail: employer.representativeEmail,
        representativePhone: employer.representativePhone,
        businessLicenseFileName: employer.businessLicenseFileName,
        businessLicenseDataUrl: employer.businessLicenseDataUrl,
        createdAt: employer.createdAt,
      })),
    payments: [...demoStore.employers.values()]
      .filter(
        (employer) =>
          employer.status === "Payment submitted" &&
          employer.payment?.status === "Pending"
      )
      .map((employer) => ({
        employerId: employer.id,
        organizationName: employer.organizationName,
        packageName: employer.payment?.method ? employer.selectedPackage ?? "" : "",
        amount: packageAmount(employer.selectedPackage),
        method: employer.payment?.method ?? "",
        transactionId: employer.payment?.transactionId ?? "",
        proofFileName: employer.payment?.proofFileName ?? "",
        proofDataUrl: employer.payment?.proofDataUrl ?? "",
        receiptUrl: employer.payment?.receiptUrl ?? "",
        submittedAt: employer.payment?.submittedAt ?? "",
      })),
  };
}

export function reviewDemoCandidate(id: string, approved: boolean): boolean {
  const account = [...demoStore.candidates.values()].find((candidate) => candidate.id === id);
  if (!account || !account.emailVerified || account.status !== "Pending admin approval") return false;
  account.status = approved ? "Approved" : "Rejected";
  return true;
}

export function reviewDemoEmployerPayment(
  employerId: string,
  approved: boolean,
  note = ""
): boolean {
  const account = demoStore.employers.get(employerId);
  if (!account || account.status !== "Payment submitted" || !account.payment) return false;
  account.payment.status = approved ? "Approved" : "Rejected";
  account.payment.reviewNote = note;
  account.status = approved ? "Approved" : "Pending payment";
  if (approved) {
    const now = new Date();
    const pkg = demoStore.subscriptionPackages.get(account.selectedPackage ?? "");
    const durationMonths = pkg?.durationMonths ?? 12;
    const endsAt = new Date(now);
    endsAt.setMonth(endsAt.getMonth() + durationMonths);
    account.subscription = {
      startsAt: now.toISOString(),
      endsAt: endsAt.toISOString(),
      traineesUsed: 0,
    };
  }
  return true;
}

export function submitDemoEmployerPayment(input: {
  sessionId: string;
  packageName: string;
  method: string;
  transactionId: string;
  receiptUrl: string;
  proofFileName?: string;
  proofDataUrl?: string;
}): { success: boolean; message: string; employerId?: string } {
  const session = demoStore.sessions.get(input.sessionId);
  const employer = session?.role === "employer"
    ? demoStore.employers.get(session.accountId)
    : undefined;
  if (
    !employer ||
    employer.status !== "Pending payment" ||
    employer.selectedPackage !== input.packageName
  ) {
    return { success: false, message: "This employer account is not ready to submit payment." };
  }
  if (
    !demoStore.subscriptionPackages.has(input.packageName) ||
    !["Telebirr", "M-Pesa", "Commercial Bank of Ethiopia (CBE)", "Dashen Bank", "Other Ethiopian bank"].includes(input.method) ||
    !input.transactionId.trim() ||
    input.transactionId.trim().length > 120 ||
    !isHttpUrl(input.receiptUrl.trim())
  ) {
    return { success: false, message: "Select a package and payment method, enter a transaction ID, and provide a valid receipt link." };
  }
  employer.payment = {
    method: input.method,
    transactionId: input.transactionId.trim(),
    receiptUrl: input.receiptUrl.trim(),
    proofFileName: input.proofFileName,
    proofDataUrl: input.proofDataUrl,
    submittedAt: new Date().toISOString(),
    status: "Pending",
  };
  employer.status = "Payment submitted";
  return { success: true, message: "Payment proof submitted and pending admin review.", employerId: employer.id };
}

export function selectDemoEmployerPackage(
  sessionId: string,
  packageName: string
): { success: boolean; message: string } {
  const session = demoStore.sessions.get(sessionId);
  const employer = session?.role === "employer"
    ? demoStore.employers.get(session.accountId)
    : undefined;
  if (!employer || employer.status !== "Pending payment") {
    return { success: false, message: "This employer account is not ready to choose a package." };
  }
  const pkg = demoStore.subscriptionPackages.get(packageName);
  if (!pkg?.active) {
    return { success: false, message: "Choose one of the available packages." };
  }
  employer.selectedPackage = packageName;
  return { success: true, message: "Package selected. Continue to payment." };
}

export function getDemoEmployerActivation(sessionId: string) {
  const session = demoStore.sessions.get(sessionId);
  if (session?.role !== "employer") return undefined;
  const employer = demoStore.employers.get(session.accountId);
  if (!employer) return undefined;
  return {
    organizationName: employer.organizationName,
    status: employer.status,
    packageName: employer.selectedPackage,
    paymentStatus: employer.payment?.status,
    reviewNote: employer.payment?.reviewNote,
    subscription: employer.subscription,
    receiptUrl: employer.payment?.receiptUrl,
  };
}
