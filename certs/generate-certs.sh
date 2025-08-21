#!/usr/bin/env bash
set -euo pipefail

HOSTS=${1:-"localhost,127.0.0.1"}
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
CERTS_DIR="$SCRIPT_DIR"
CA_DIR="$CERTS_DIR/ca"
TRUST_DIR="$CERTS_DIR/trust"
mkdir -p "$CA_DIR" "$TRUST_DIR"

CA_KEY="$CA_DIR/localCA.key"
CA_CRT="$CA_DIR/localCA.crt"
if [[ ! -f "$CA_KEY" || ! -f "$CA_CRT" ]]; then
  echo "Generating local CA..."
  openssl genrsa -out "$CA_KEY" 2048 >/dev/null 2>&1
  openssl req -x509 -new -nodes -key "$CA_KEY" -sha256 -days 3650 -out "$CA_CRT" -subj "/CN=Notety Local CA" >/dev/null 2>&1
fi

# Build SAN list
ALT_NAMES=""
IFS=',' read -ra parts <<< "$HOSTS"
idx_dns=1
idx_ip=1
for h in "${parts[@]}"; do
  if [[ "$h" =~ ^[0-9.]+$ ]]; then
    ALT_NAMES+=$'IP.'$idx_ip' = '$h$'\n'
    ((idx_ip++))
  else
    ALT_NAMES+=$'DNS.'$idx_dns' = '$h$'\n'
    ((idx_dns++))
  fi
done

TMP_CNF=$(mktemp)
cat > "$TMP_CNF" <<EOF
[ req ]
distinguished_name = dn
prompt = no
x509_extensions = v3_req
[ dn ]
CN = notety.local
[ v3_req ]
subjectAltName = @alt_names
[ alt_names ]
$ALT_NAMES
EOF

SERVER_KEY="$CERTS_DIR/server.key"
SERVER_CSR="$CERTS_DIR/server.csr"
SERVER_CRT="$CERTS_DIR/server.crt"

echo "Generating server key and CSR..."
openssl genrsa -out "$SERVER_KEY" 2048 >/dev/null 2>&1
openssl req -new -key "$SERVER_KEY" -out "$SERVER_CSR" -subj "/CN=notety.local" -config "$TMP_CNF" >/dev/null 2>&1

echo "Signing server certificate with local CA..."
openssl x509 -req -in "$SERVER_CSR" -CA "$CA_CRT" -CAkey "$CA_KEY" -CAcreateserial -out "$SERVER_CRT" -days 825 -sha256 -extensions v3_req -extfile "$TMP_CNF" >/dev/null 2>&1

cp "$CA_CRT" "$TRUST_DIR/notety-local-ca.crt"
rm -f "$SERVER_CSR" "$TMP_CNF"

echo "Done. Created:
  $SERVER_CRT
  $SERVER_KEY
CA to trust on clients:
  $TRUST_DIR/notety-local-ca.crt"
