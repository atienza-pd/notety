export function createGuid(): string {
  const uuid = (globalThis as any)?.crypto?.randomUUID?.();
  if (uuid) return uuid as string;
  // Fallback RFC4122 v4 (not cryptographically strong)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
