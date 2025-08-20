#!/bin/sh
set -eu

CERT_DIR="/etc/nginx/certs"
KEY_FILE="$CERT_DIR/server.key"
CRT_FILE="$CERT_DIR/server.crt"

mkdir -p "$CERT_DIR"

gen_with_addext() {
  openssl req -x509 -newkey rsa:2048 -sha256 -days 365 \
    -nodes -keyout "$KEY_FILE" -out "$CRT_FILE" \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:0.0.0.0"
}

gen_with_cnf() {
  TMP_CNF=$(mktemp)
  cat > "$TMP_CNF" <<EOF
[ req ]
distinguished_name = dn
prompt = no
x509_extensions = v3_req
[ dn ]
CN = localhost
[ v3_req ]
subjectAltName = @alt_names
[ alt_names ]
DNS.1 = localhost
IP.1 = 127.0.0.1
IP.2 = 0.0.0.0
EOF
  openssl req -x509 -newkey rsa:2048 -sha256 -days 365 -nodes \
    -keyout "$KEY_FILE" -out "$CRT_FILE" -config "$TMP_CNF"
  rm -f "$TMP_CNF"
}

# If no certs are provided via volume, generate a quick self-signed one for local/LAN
if [ ! -f "$KEY_FILE" ] || [ ! -f "$CRT_FILE" ]; then
  echo "No TLS certs found. Generating self-signed certificate for local/LAN testing..."
  if openssl req -help 2>&1 | grep -q "-addext"; then
    gen_with_addext || gen_with_cnf
  else
    gen_with_cnf
  fi
fi

# Launch nginx
exec nginx -g 'daemon off;'
