export const isPlainObject = (x: any): x is Record<PropertyKey, unknown> => {
  if (x === null || typeof x === "undefined") return false;
  if (Array.isArray(x)) return false;
  if (x instanceof Date) return false;
  return Object.getPrototypeOf(x) === Object.prototype;
};

export type HasResult<Keys extends [string, ...string[]] | [string]> = {
  [P in keyof Keys as [Keys[P]] extends [string] ? Keys[P] : never]: unknown;
};

const hasKey = (x: unknown, key: string): boolean => {
  if (typeof x === "undefined" || x === null) return false;
  try {
    if (Object.hasOwn(x, key)) return true;
  } catch {}
  try {
    if (typeof x === "object" && x !== null && key in x) return true;
  } catch {}
  try {
    if (Object.keys(x).includes(key)) return true;
  } catch {}
  return false;
};

export function has<Keys extends [string, ...string[]] | [string]>(
  x: unknown,
  ...keys: Keys
): x is HasResult<typeof keys> {
  if (typeof x === "undefined" || x === null) return false;
  return keys.every((k) => hasKey(x, k));
}
