export function extractResultText(result: unknown): string {
  if (!isRecord(result)) {
    return stringifyUnknown(result);
  }

  const messages = result['messages'];
  if (!Array.isArray(messages)) {
    return stringifyUnknown(result);
  }

  const lastMessage = messages.at(-1);
  if (!isRecord(lastMessage)) {
    return stringifyUnknown(result);
  }

  const content = asRecord(lastMessage['kwargs'])?.['content'] ?? lastMessage['content'];

  if (typeof content === 'string') {
    return content;
  }

  return stringifyUnknown(content);
}

export function stringifyUnknown(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
