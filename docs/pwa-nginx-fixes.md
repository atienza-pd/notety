Issue: Nginx Setup

Fix:

```
server {
  listen 80;
  server_name your.domain;
  root /var/www/notety/dist/notety/browser;  # adjust to your dist path
  index index.html;

  # Serve app shell (Angular SPA)
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Do NOT cache the service worker or its config (ensures updates)
  location = /ngsw-worker.js {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    expires -1;
    try_files $uri =404;
  }
  location = /ngsw.json {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    expires -1;
    try_files $uri =404;
  }

  # Long-cache hashed assets
  location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  # Make sure the manifest has the right MIME type
  types { application/manifest+json webmanifest; }
  location = /manifest.webmanifest {
    add_header Cache-Control "no-cache";
    try_files $uri =404;
  }

  # Optional: avoid caching index.html so updates are detected quickly
  location = /index.html {
    add_header Cache-Control "no-cache";
    try_files $uri =404;
  }
}
```

If deploying under a sub-path (e.g., https://your.domain/notety/):

- Build with base-href and deploy-url:
  - Windows PowerShell: ng build --base-href /notety/ --deploy-url /notety/
- Update manifest start_url, scope, and id to /notety/
- Ensure NGINX location /notety/ uses the same rules above and root points to that build output.

This setup will let the PWA install and update correctly.server {
listen 80;
server_name your.domain;
root /var/www/notety/dist/notety/browser; # adjust to your dist path
index index.html;

# Serve app shell (Angular SPA)

location / {
try_files $uri $uri/ /index.html;
}

# Do NOT cache the service worker or its config (ensures updates)

location = /ngsw-worker.js {
add_header Cache-Control "no-cache, no-store, must-revalidate";
expires -1;
try_files $uri =404;
}
location = /ngsw.json {
add_header Cache-Control "no-cache, no-store, must-revalidate";
expires -1;
try_files $uri =404;
}

# Long-cache hashed assets

location ~\* \.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$ {
expires 1y;
add_header Cache-Control "public, max-age=31536000, immutable";
try_files $uri =404;
}

# Make sure the manifest has the right MIME type

types { application/manifest+json webmanifest; }
location = /manifest.webmanifest {
add_header Cache-Control "no-cache";
try_files $uri =404;
}

# Optional: avoid caching index.html so updates are detected quickly

location = /index.html {
add_header Cache-Control "no-cache";
try_files $uri =404;
}
}

```

If deploying under a sub-path (e.g., https://your.domain/notety/):
- Build with base-href and deploy-url:
  - Windows PowerShell: ng build --base-href /notety/ --deploy-url /notety/
- Update manifest start_url, scope, and id to /notety/
- Ensure NGINX location /notety/ uses the same rules above and root points to that build output.

This setup will let the PWA install and update correctly.
```

Issue:
browser trying to download an “unknown file” when hitting your NGINX site, that’s typically a MIME type or root misconfiguration:

Fix:
Ensure NGINX includes MIME types and sets webmanifest correctly:

```
# http { ... }
include /etc/nginx/mime.types;
types { application/manifest+json webmanifest; }
```

Point root to your dist folder (not the project root) and use SPA fallback:

```
root /var/www/notety/dist/notety/browser;  # or /dist/notety if no /browser
location / { try_files $uri $uri/ /index.html; }
```

- Do not cache ngsw-worker.js and ngsw.json to allow updates.

Issue:
there is no Service Workers: status “Activated and is running”, after i deployed in an nginx server

Fix:

Use HTTPS
Service workers require HTTPS (except localhost). If you’re visiting http://…, registration will fail.

Verify the SW files exist on the server
They must return 200:

```
curl -I https://your.site/ngsw-worker.js
curl -I https://your.site/ngsw.json
```

If 404, your build isn’t producing them or NGINX root is wrong. Build with production config and SW enabled.

Ensure Angular build enables the service worker

In angular.json, enable it for production:

```
// ...existing code...
"build": {
  "builder": "@angular-devkit/build-angular:application",
  "options": {
    "outputPath": "dist/notety"
    // ...existing code...
  },
  "configurations": {
    "production": {
      "serviceWorker": true,
      "ngswConfigPath": "ngsw-config.json"
    }
  }
}
// ...existing code...
```

Rebuild and redeploy:
`ng build --configuration production`

NGINX must serve the right folder and headers
Root must point to your dist (often /dist/notety/browser).
Don’t cache the SW and config; keep SPA fallback for others:

```
# ...existing server block...
location = /ngsw-worker.js { add_header Cache-Control "no-cache, no-store, must-revalidate"; try_files $uri =404; }
location = /ngsw.json      { add_header Cache-Control "no-cache, no-store, must-revalidate"; try_files $uri =404; }
location / { try_files $uri $uri/ /index.html; }
```

Ensure MIME types are loaded (so JS isn’t served as text/plain):

```
# in http { ... }
include /etc/nginx/mime.types;
types { application/manifest+json webmanifest; }
```

Check base href and paths
If served under a sub-path (e.g., /notety/), build with:

`ng build --configuration production --base-href /notety/ --deploy-url /notety/`

Console diagnostics (in the deployed site)

```
// Should be false only on dev
ngDevMode
// Try manual registration error details
navigator.serviceWorker.register('ngsw-worker.js').catch(e => console.error(e))
// See all registrations
navigator.serviceWorker.getRegistrations().then(r => console.log(r))
```

Optional: speed up registration during debugging

```
// ...existing code...
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerImmediately',
}),
// ...existing code...
```
