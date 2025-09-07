import {
  logSensitiveDataConsoleWarning,
  SENSITIVE_WARNING_CONSOLE_FLAG,
} from './security-warning';

describe('logSensitiveDataConsoleWarning', () => {
  beforeEach(() => {
    // reset the flag between tests
    delete (globalThis as Record<string, unknown>)[
      SENSITIVE_WARNING_CONSOLE_FLAG
    ];
  });

  it('logs exactly once per session flag', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => void 0);
    logSensitiveDataConsoleWarning();
    expect(spy).toHaveBeenCalledTimes(1);
    logSensitiveDataConsoleWarning();
    expect(spy).toHaveBeenCalledTimes(1); // still 1 — no duplicate
    spy.mockRestore();
  });
});
