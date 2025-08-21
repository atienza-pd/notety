This folder can hold HTTPS certificates for local/LAN testing.

Two options:

1. Use mkcert (recommended)

   - Install mkcert and trust the local CA on your machine
   - Generate certs for your hostnames/IPs
   - Copy/rename to server.crt and server.key here

2. Use the helper scripts in this folder to create a local CA and a server cert signed by it
   - Windows: run .\generate-certs.ps1
   - macOS/Linux: run ./generate-certs.sh

After generating:

- server.crt and server.key will be created
- trust/ folder contains the CA certificate you must import into client machines (Trusted Root)
- Update docker-compose to mount ./certs into /etc/nginx/certs if using external certs
