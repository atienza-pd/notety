export function createGuid(): string {
  const uuidFn = (globalThis as { crypto?: { randomUUID?: unknown } }).crypto
    ?.randomUUID;
  if (typeof uuidFn === 'function') {
    return (uuidFn as () => string)();
  }
  // Fallback RFC4122 v4 (not cryptographically strong)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
