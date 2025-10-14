import { bootstrapApplication } from '@angular/platform-browser';
import { isDevMode } from '@angular/core';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { logSensitiveDataConsoleWarning } from './app/shared/utils/security-warning';
import { versionInfo } from './version';

// One-time console warning for security (reinforces in-app banner)
logSensitiveDataConsoleWarning();

// Log version info in production
if (!isDevMode()) {
  console.log(
    `%cNotety v${versionInfo.version}`,
    'color: #0ea5e9; font-weight: bold; font-size: 14px;'
  );
  console.log(`Git Commit: ${versionInfo.gitCommit.substring(0, 7)}`);
  console.log(`Build Date: ${versionInfo.buildDate}`);
}

bootstrapApplication(App, appConfig).catch((err: unknown): void =>
  console.error(err)
);
