import { createGuid } from './guid';

describe('createGuid', () => {
  const v4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('generates a v4-like GUID with correct format when crypto.randomUUID is not available', () => {
    type CryptoLike = { randomUUID?: () => string } | undefined;
    const g = globalThis as unknown as Record<string, unknown>;
    const originalCrypto = g['crypto'] as CryptoLike;
    // remove crypto to force fallback
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const id = createGuid();
    expect(v4Regex.test(id)).toBe(true);

    // restore
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true,
      writable: true,
    });
  });

  it('uses crypto.randomUUID when available and returns its value', () => {
    const mockValue = '123e4567-e89b-12d3-a456-426614174000';
    const mockCrypto = { randomUUID: jest.fn(() => mockValue) };
    type CryptoLike = { randomUUID?: () => string } | undefined;
    const g = globalThis as unknown as Record<string, unknown>;
    const originalCrypto = g['crypto'] as CryptoLike;
    Object.defineProperty(globalThis, 'crypto', {
      value: mockCrypto,
      configurable: true,
      writable: true,
    });

    const id = createGuid();
    expect(id).toBe(mockValue);
    expect(mockCrypto.randomUUID).toHaveBeenCalledTimes(1);

    // restore
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true,
      writable: true,
    });
  });

  it('produces unique values across multiple calls (basic sanity)', () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      set.add(createGuid());
    }
    expect(set.size).toBe(1000);
  });
});
