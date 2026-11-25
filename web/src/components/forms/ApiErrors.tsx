import type { NormalizedApiErrors } from "@/lib/api/errors";

export function FieldErrors({ errors, field }: { errors: NormalizedApiErrors; field: string }) {
  const messages = errors.fieldErrors[field] ?? [];
  if (!messages.length) return null;
  return <ul className="mt-1 space-y-1 text-xs text-red-700">{messages.map((message, index) => <li key={`${field}-${index}`}>{message}</li>)}</ul>;
}

export function FormErrors({ errors }: { errors: NormalizedApiErrors }) {
  if (!errors.formErrors.length) return null;
  return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><ul className="space-y-1">{errors.formErrors.map((message, index) => <li key={`${index}-${message}`}>{message}</li>)}</ul></div>;
}
