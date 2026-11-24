type Account = {
  email: string;
  password: string;
  role: 'candidate' | 'employer' | 'admin';
  name: string;
  status: string;
};

// Simple in‑memory list of real accounts (for local testing only)
export const realAccounts: Account[] = [
  {
    email: 'candidate@example.com',
    password: 'candypass',
    role: 'candidate',
    name: 'Alice Candidate',
    status: 'Approved',
  },
  {
    email: 'employer@example.com',
    password: 'employerpass',
    role: 'employer',
    name: 'Bob Employer',
    status: 'Approved',
  },
  {
    email: 'admin@example.com',
    password: 'adminpass',
    role: 'admin',
    name: 'Carol Admin',
    status: 'Approved',
  },
];

// Simple in‑memory session store (sessionId -> account)
const sessionStore = new Map<string, Account>();

function generateSessionId(): string {
  // Very naive GUID‑like generator for local use
  return 'real-' + Math.random().toString(36).substring(2, 15);
}

/** Create a session for the given account and store it in memory */
export function createSession(account: Account): string {
  const sessionId = generateSessionId();
  sessionStore.set(sessionId, account);
  return sessionId;
}

/** Retrieve the account associated with a sessionId (used by other routes if needed) */
export function getSessionAccount(sessionId: string): Account | undefined {
  return sessionStore.get(sessionId);
}
