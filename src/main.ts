import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { logSensitiveDataConsoleWarning } from './app/shared/utils/security-warning';
import {
  APP_VERSION,
  BUILD_COMMIT,
  BUILD_BRANCH,
  BUILD_TIME_UTC,
} from './environments/version';

// One-time console warning for security (reinforces in-app banner)
logSensitiveDataConsoleWarning();

// Application build/version metadata (visible in DevTools)
console.info(
  '[Notety] Version:',
  APP_VERSION,
  '\n commit:',
  BUILD_COMMIT,
  '\n branch:',
  BUILD_BRANCH,
  '\n built (UTC):',
  BUILD_TIME_UTC
);

bootstrapApplication(App, appConfig).catch((err: unknown): void =>
  console.error(err)
);
