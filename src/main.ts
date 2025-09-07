import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { logSensitiveDataConsoleWarning } from './app/shared/utils/security-warning';

// One-time console warning for security (reinforces in-app banner)
logSensitiveDataConsoleWarning();

bootstrapApplication(App, appConfig).catch((err: unknown): void =>
  console.error(err)
);
