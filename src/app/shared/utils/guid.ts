export function createGuid(): string {
  type CryptoLike = { randomUUID?: () => string };
  const cryptoLike: CryptoLike | undefined = (
    globalThis as { crypto?: CryptoLike }
  ).crypto;
  if (cryptoLike?.randomUUID) {
    // Bind/call to preserve the original receiver and avoid "Illegal invocation" errors
    return cryptoLike.randomUUID.call(cryptoLike);
  }
  // Fallback RFC4122 v4 (not cryptographically strong)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
