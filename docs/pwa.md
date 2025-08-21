# Notety

A small note-taking app built with Angular.

## Progressive Web App (PWA)

Notety is a PWA:

- Offline-ready via Angular Service Worker
- Installable on desktop and mobile (Add to Home Screen)
- Notes stored in `localStorage` so they persist offline

Try it locally (production build):

1. Build, 2) Serve the built files. Service workers work on HTTPS or on `localhost` over HTTP.

```powershell
npm run build
npm run serve:dist
```

Open http://localhost:8080, then use DevTools → Application → Service Workers to confirm it’s “Activated and is running”.

Notes:

- SW registers only in production; `ng serve` disables it by default.
- Update icons in `public/icons` for your brand.

Deploying behind NGINX (HTTPS):

- Use the concise guide with correct headers, MIME types, and caching: [docs/pwa-nginx-fixes.md](docs/pwa-nginx-fixes.md)
- For LAN testing across devices without a domain, use mkcert and trust the CA on clients (Windows, macOS, Linux, Android) — steps in the doc above.

Sub-path deploy (e.g., `/notety/`):

```powershell
ng build --configuration production --base-href /notety/ --deploy-url /notety/
```

Quick checks:

- `https://host/ngsw-worker.js` and `https://host/ngsw.json` return 200
- Manifest served as `application/manifest+json`
- Don’t cache `ngsw-worker.js`/`ngsw.json`; keep SPA fallback (`try_files ... /index.html`)

### Troubleshooting PWA

- Service worker doesn’t register

  - Cause: Dev build/`ng serve`, HTTP (non-localhost), or missing SW files.
  - Fix: `npm run build` then `npm run serve:dist`; use HTTPS or `http://localhost`; visit `/ngsw-worker.js` and `/ngsw.json` to ensure 200.

- “Unknown file” download or 404 for manifest/SW

  - Cause: Wrong NGINX root, missing SPA fallback, or MIME types.
  - Fix: Root should point to `dist/notety/browser`; add `try_files $uri $uri/ /index.html;`; include `mime.types` and `types { application/manifest+json webmanifest; }`.

- Updates not arriving (old app cached)
  - Cause: `ngsw-worker.js` / `ngsw.json` cached; `index.html` cached.
  - Fix: Add `Cache-Control: no-cache, no-store` to those files (and no-cache for `index.html`); hard refresh (Ctrl+F5). See [docs/pwa-nginx-fixes.md](docs/pwa-nginx-fixes.md).

Manual debug (paste in DevTools Console):

```js
navigator.serviceWorker.register("ngsw-worker.js").catch(console.error);
```
