import { normalizeApiErrors, firstApiError, type NormalizedApiErrors } from "@/lib/api/errors";

export class UserApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
    public readonly errors: NormalizedApiErrors = normalizeApiErrors(data),
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "UserApiError";
  }
}

async function userRequest<T>(endpoint: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/user/${endpoint}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const retryHeader = response.headers.get("retry-after");
    const retryAfterSeconds = retryHeader && /^\d+$/.test(retryHeader) ? Number(retryHeader) : undefined;
    throw new UserApiError(
      response.status,
      firstApiError(data, response.status === 429 ? "Too many requests. Please try again later." : "The request could not be completed."),
      data,
      normalizeApiErrors(data),
      retryAfterSeconds,
    );
  }
  return data as T;
}

export type RegistrationInput = {
  first_name: string;
  middle_name: string;
  last_name: string;
  email_address?: string;
  phone_number: string;
  password: string;
  password2: string;
  invitation_link?: string;
};

export const userService = {
  register: (input: RegistrationInput) => userRequest<unknown>("register/", "POST", input),
  logout: () => userRequest<unknown>("logout/", "POST"),
  refresh: () => userRequest<unknown>("refresh/", "POST"),
  changeProfile: (input: { first_name?: string; last_name?: string; phone_number?: string }) =>
    userRequest<unknown>("change-profile/", "PUT", input),
  changePassword: (input: { current_password: string; password_1: string; password_2: string }) =>
    userRequest<unknown>("change-password/", "PATCH", input),
  requestPasswordReset: (email_address: string) =>
    userRequest<unknown>("forget-password/", "POST", { email_address }),
  resetPassword: (input: { password_1: string; password_2: string; uidb64: string; token: string }) =>
    userRequest<unknown>("reset-password/", "PUT", input),
  confirmPasswordReset: (uidb64: string, token: string) =>
    userRequest<unknown>(`reset-password-confirm/${encodeURIComponent(uidb64)}/${encodeURIComponent(token)}/`, "GET"),
  verifyEmail: (phone: string, code: string) => userRequest<unknown>("verify-email/", "POST", { phone, code }),
  resendOtp: (email_address: string) => userRequest<unknown>("resend-otp/", "POST", { email_address }),
};
