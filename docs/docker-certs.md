# HTTPS certificates for Docker/NGINX (local/LAN)

This guide shows how to generate and use HTTPS certificates for the Docker deployment that serves Notety with NGINX on ports 8080 (HTTP) and 8443 (HTTPS).

Use this for local or LAN testing only. Do not use these certificates in production.

## Where certs live

- Host folder: `./certs`
- Inside container: `/etc/nginx/certs`
- Files expected by NGINX: `server.crt` and `server.key`

The provided `docker-compose.yml` maps `./certs` to `/etc/nginx/certs` read-only.

## Option A — Use the helper scripts (OpenSSL)

The repo includes scripts to create a local CA and a server certificate signed by it.

Windows (PowerShell):

```powershell
./certs/generate-certs.ps1 -Hosts "localhost,127.0.0.1,192.168.1.50,notety.local"
```

macOS/Linux (Bash):

```bash
./certs/generate-certs.sh "localhost,127.0.0.1,192.168.1.50,notety.local"
```

What you get:

- `certs/server.crt` and `certs/server.key`
- `certs/trust/notety-local-ca.crt` — import this CA on client devices so they trust the HTTPS connection (Trusted Root)

Notes:

- Include every hostname/IP you’ll use in the `-Hosts`/argument list (CN/SAN). For LAN devices, add your machine IP and any chosen mDNS/hosts name.
- Requires OpenSSL in your PATH.

## Option B — Use mkcert (recommended for simplicity)

1. Install mkcert and trust its local CA on your machine.

2. Generate certs for your hostnames/IPs into the `certs` folder:

```bash
mkcert -install
mkcert -cert-file certs/server.crt -key-file certs/server.key localhost 127.0.0.1 ::1 192.168.1.50 notety.local
```

mkcert automatically creates and trusts a local CA on the host. For other client devices, copy the CA from the host and trust it there as well if needed.

## Use with Docker

1. Ensure files exist on the host:

- `certs/server.crt`
- `certs/server.key`

2. Start/restart the stack:

```powershell
docker compose up -d --build
```

3. Open:

- HTTPS: https://localhost:8443
- HTTP: http://localhost:8080 (redirects to HTTPS)

4. Verify in browser DevTools → Application → Service Workers that the PWA is active. Optionally confirm `https://localhost:8443/ngsw-worker.js` and `https://localhost:8443/ngsw.json` return 200.

## Trusting the local CA (clients)

- Windows: Import `certs/trust/notety-local-ca.crt` into Trusted Root Certification Authorities.
- macOS: Add to Keychain Access → System keychain → Always Trust.
- Linux: Steps vary by distro and browser; for Chrome, import to system store; for Firefox, import to Authorities.
- Android: Transfer and install the CA certificate (user credential). Note: Android marks user CAs; that’s fine for testing.

## Troubleshooting

- Browser warning persists: Ensure the client trusts the CA and that the hostname/IP you’re visiting is included in the cert’s SANs.
- 502/404 after enabling HTTPS: Confirm `server.crt`/`server.key` paths and permissions; compose mounts `./certs -> /etc/nginx/certs`.
- Updates not arriving: Don’t cache `ngsw-worker.js` and `ngsw.json` (already configured in `nginx.conf`). Hard refresh (Ctrl+F5).

For additional PWA/Nginx specifics, see `docs/pwa-nginx-fixes.md`.
