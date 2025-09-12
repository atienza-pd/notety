Issue:
Running pwa silently

Fix:

# Use the folder that exists in your build (pick one of these)

npx http-server .\dist\notety\browser -p 8080 -c-1 --silent

# or

npx http-server .\dist\notety -p 8080 -c-1 --silent

Issue:
Verify in DevTools (Chrome/Edge) if PWA is working

Fix:
Application > Manifest: no errors; icons render; “Installability” shows “Installable”.
Application > Service Workers: status “Activated and is running”, correct scope.
Console checks:
navigator.serviceWorker.controller !== null
await navigator.serviceWorker.ready.then(r => r.scope)

Test offline
In DevTools > Network, enable “Offline” and hard-reload. The app should load and work (data persists via localStorage).
Navigate around; static assets should still load.
Check PWA artifacts are served
Open /manifest.webmanifest and /ngsw.json directly; both should return JSON with correct MIME types.
Open /ngsw-worker.js; it should be served and not cached aggressively.
Optional audits
Run Lighthouse > PWA. You should see “Installable” and “PWA Optimized” pass.
