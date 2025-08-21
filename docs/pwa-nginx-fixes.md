# PWA + NGINX: Concise Setup and Fixes

Use this minimal, reliable config to serve an Angular PWA with NGINX and ensure the service worker installs and updates correctly.

## What you’ll do

- Enable Angular Service Worker and build for production
- Configure NGINX (SPA fallback, SW no-cache, static caching, manifest MIME)
- Enable HTTPS (Let’s Encrypt or mkcert)
- Verify with a few quick checks

## NGINX (root at your built dist)

```nginx
server {
  listen 80;
  server_name your.domain;  # or IP/hostname

  root /var/www/notety/dist/notety/browser;  # adjust to your build output
  index index.html;

  # SPA fallback
  location / { try_files $uri $uri/ /index.html; }

  # Do not cache service worker & config (allow updates)
  location = /ngsw-worker.js { add_header Cache-Control "no-cache, no-store, must-revalidate"; expires -1; try_files $uri =404; }
  location = /ngsw.json      { add_header Cache-Control "no-cache, no-store, must-revalidate"; expires -1; try_files $uri =404; }

  # Long-cache hashed static assets
  location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  # Manifest MIME & no-cache
  include /etc/nginx/mime.types;
  types { application/manifest+json webmanifest; }
  location = /manifest.webmanifest { add_header Cache-Control "no-cache"; try_files $uri =404; }

  # Optional: avoid caching app shell
  location = /index.html { add_header Cache-Control "no-cache"; try_files $uri =404; }
}
```

If serving under a sub-path (e.g., /notety/):

- Build: `ng build --configuration production --base-href /notety/ --deploy-url /notety/`
- Ensure `manifest.webmanifest` start_url, scope, and id match `/notety/`
- Use the same NGINX rules but under `location /notety/` and with `root` pointing to that build output

## Angular build (enable Service Worker)

In `angular.json` production config:

- `serviceWorker: true`
- `ngswConfigPath: ngsw-config.json`

Build and deploy:

- `ng build --configuration production`

Example `angular.json` fragment:

```jsonc
// angular.json
{
  "projects": {
    "notety": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": { "outputPath": "dist/notety" },
          "configurations": {
            "production": {
              "serviceWorker": true,
              "ngswConfigPath": "ngsw-config.json"
            }
          }
        }
      }
    }
  }
}
```

## HTTPS requirement

Service workers need HTTPS (except on `localhost/127.0.0.1`).

How to configure:

- Public domain (Let’s Encrypt):

  1. Install certbot and request a cert that auto-wires NGINX and redirects HTTP→HTTPS

  ```bash
  sudo apt update
  sudo apt install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d your.domain --redirect -m you@example.com --agree-tos
  ```

- LAN only (mkcert, locally trusted):
  1. Install mkcert and create a local CA
  ```bash
  sudo apt update
  sudo apt install -y mkcert libnss3-tools
  mkcert -install
  ```
  2. Generate a cert for your IP/hostname and place it where NGINX can read it
  ```bash
  mkcert 192.168.1.50 notety.local
  sudo mkdir -p /etc/nginx/certs
  sudo cp 192.168.1.50+1.pem /etc/nginx/certs/notety.pem
  sudo cp 192.168.1.50+1-key.pem /etc/nginx/certs/notety-key.pem
  ```
  3. Trust mkcert’s Root CA on each client (see `mkcert -CAROOT`)

HTTPS NGINX example (redirect 80→443):

```nginx
server { listen 80; server_name 192.168.1.50 notety.local; return 301 https://$host$request_uri; }
server {
  listen 443 ssl http2;
  server_name 192.168.1.50 notety.local;

  root /var/www/notety/dist/notety/browser;  # adjust
  index index.html;

  ssl_certificate     /etc/nginx/certs/notety.pem;
  ssl_certificate_key /etc/nginx/certs/notety-key.pem;

  include /etc/nginx/mime.types;
  types { application/manifest+json webmanifest; }

  location / { try_files $uri $uri/ /index.html; }
  location = /ngsw-worker.js { add_header Cache-Control "no-cache, no-store, must-revalidate"; expires -1; try_files $uri =404; }
  location = /ngsw.json      { add_header Cache-Control "no-cache, no-store, must-revalidate"; expires -1; try_files $uri =404; }
  location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$ { expires 1y; add_header Cache-Control "public, max-age=31536000, immutable"; try_files $uri =404; }
  location = /manifest.webmanifest { add_header Cache-Control "no-cache"; try_files $uri =404; }
  location = /index.html          { add_header Cache-Control "no-cache"; try_files $uri =404; }
}
```

Reload NGINX after changes:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Trust the certificate on clients (mkcert Root CA)

Find the CA: on the machine that generated the certs, run `mkcert -CAROOT` and copy `rootCA.pem` to client devices.

- Windows

  - Option A (UI): rename to `.crt` if needed → double‑click → install for "Local Machine" → place in "Trusted Root Certification Authorities".
  - Option B (PowerShell): `certutil -addstore -f Root path\to\rootCA.pem`
  - Firefox uses its own store: Preferences → Certificates → Authorities → Import (or enable `security.enterprise_roots.enabled`).

- macOS

  - Double‑click `rootCA.pem` → Keychain Access → add to "System" keychain → open it and set "Always Trust".
  - Firefox: Preferences → Certificates → Authorities → Import (or enable enterprise roots).

- Linux

  - Debian/Ubuntu: `sudo cp rootCA.pem /usr/local/share/ca-certificates/mkcert_root.crt` → `sudo update-ca-certificates`
  - RHEL/Fedora: `sudo cp rootCA.pem /etc/pki/ca-trust/source/anchors/` → `sudo update-ca-trust`
  - Firefox: Preferences → Certificates → Authorities → Import.

- Android
  - Copy `rootCA.pem` to the phone, rename to `.crt` if needed.
  - Settings → Security (or Security & privacy) → Encryption & credentials → Install a certificate → CA certificate → select file.
  - Note: Android shows a "network may be monitored" notice for user CAs.

Notes

- Visit the exact host/IP you included in the cert SANs (e.g., `https://192.168.1.50` or `https://notety.local`).
- Service workers won’t register if the page isn’t a trusted secure context.
- Using Let’s Encrypt on a public domain requires no client trust steps.

## Quick checks

- Files exist and are 200:
  - `https://host/ngsw-worker.js`
  - `https://host/ngsw.json`
- Correct MIME types loaded; manifest served as `application/manifest+json`.
- DevTools → Application → Service Workers: status should be “Activated and is running”.
- Console: `navigator.serviceWorker.register('ngsw-worker.js').catch(console.error)` to see errors.

## Common fixes

- Wrong root: point NGINX `root` to the built dist (often `/dist/notety/browser`).
- Caching: ensure `ngsw-worker.js` and `ngsw.json` aren’t cached.
- Sub-path: build with `--base-href` and `--deploy-url` and update manifest scope/start_url.
- HTTP: switch to HTTPS; a non‑trusted/self‑signed cert won’t allow SW on non‑localhost.
- MIME: include `mime.types` and set `types { application/manifest+json webmanifest; }`.
