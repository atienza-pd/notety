/**
 * Logs a one-time security warning to the developer console reminding users not to store sensitive data.
 * The banner UI handles end-user messaging; this reinforces it for anyone inspecting DevTools.
 */
const FLAG = '__NOTETY_SENSITIVE_WARNING_LOGGED__';

export function logSensitiveDataConsoleWarning(): void {
  const g = globalThis as Record<string, unknown>;
  if (g[FLAG]) return; // already logged this session
  g[FLAG] = true;
  try {
    console.warn(
      'Notety security notice: Do NOT store passwords, API keys, tokens, personal, regulated, or otherwise sensitive/confidential data here. Notes are stored unencrypted in localStorage and may be readable by scripts or anyone with device access.'
    );
  } catch {
    /* ignore */
  }
}

// Re-export flag name for potential testing/debug (not currently used in tests directly)
export const SENSITIVE_WARNING_CONSOLE_FLAG = FLAG;
