export type NormalizedApiErrors = {
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
};

const FORM_ERROR_KEYS = new Set(["detail", "message", "msg", "error", "non_field_errors"]);

function addMessage(target: string[], value: unknown) {
  if (typeof value === "string" && value.trim()) target.push(value);
  else if (typeof value === "number") target.push(String(value));
}

export function normalizeApiErrors(body: unknown): NormalizedApiErrors {
  const fieldErrors: Record<string, string[]> = {};
  const formErrors: string[] = [];
  const seen = new Set<string>();

  const visit = (value: unknown, keyPath: string[] = []) => {
    if (Array.isArray(value)) {
      if (value.every((item) => typeof item === "string" || typeof item === "number")) {
        const messages = value.map(String).filter(Boolean);
        if (!messages.length) return;
        const key = keyPath.at(-1);
        if (!key || FORM_ERROR_KEYS.has(key)) formErrors.push(...messages);
        else (fieldErrors[keyPath.join(".")] ??= []).push(...messages);
        return;
      }
      value.forEach((item, index) => visit(item, [...keyPath, String(index)]));
      return;
    }

    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if ("details" in record && ("error" in record || "detail" in record)) {
        visit(record.details, keyPath);
        return;
      }
      for (const [key, nested] of Object.entries(record)) {
        if (key === "details" && Object.keys(record).length === 1) visit(nested, keyPath);
        else visit(nested, [...keyPath, key]);
      }
      return;
    }

    const key = keyPath.at(-1);
    const messageTarget = !key || FORM_ERROR_KEYS.has(key)
      ? formErrors
      : (fieldErrors[keyPath.join(".")] ??= []);
    addMessage(messageTarget, value);
  };

  visit(body);
  for (const [key, messages] of Object.entries(fieldErrors)) {
    fieldErrors[key] = messages.filter((message) => {
      const identity = `${key}:${message}`;
      if (seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
  }
  const uniqueFormErrors = [...new Set(formErrors)];
  return { fieldErrors, formErrors: uniqueFormErrors };
}

export function firstApiError(body: unknown, fallback: string): string {
  const errors = normalizeApiErrors(body);
  return errors.formErrors[0] ?? Object.values(errors.fieldErrors).flat()[0] ?? fallback;
}
