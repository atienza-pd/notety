#!/bin/sh
set -eu

CERT_DIR="/etc/nginx/certs"
KEY_FILE="$CERT_DIR/server.key"
CRT_FILE="$CERT_DIR/server.crt"

mkdir -p "$CERT_DIR"

# If no certs are provided via volume, generate a quick self-signed one for local/LAN
if [ ! -f "$KEY_FILE" ] || [ ! -f "$CRT_FILE" ]; then
  echo "No TLS certs found. Generating self-signed certificate for local/LAN testing..."
  openssl req -x509 -newkey rsa:2048 -sha256 -days 365 \
    -nodes -keyout "$KEY_FILE" -out "$CRT_FILE" \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:0.0.0.0"
fi

# Launch nginx
exec nginx -g 'daemon off;'
