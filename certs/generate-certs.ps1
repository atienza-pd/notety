param(
  [string]$Hosts = "localhost,127.0.0.1"
)

$ErrorActionPreference = 'Stop'

$certsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$caDir = Join-Path $certsDir 'ca'
$trustDir = Join-Path $certsDir 'trust'
New-Item -ItemType Directory -Force -Path $caDir,$trustDir | Out-Null

# Generate local CA if missing
$caKey = Join-Path $caDir 'localCA.key'
$caCrt = Join-Path $caDir 'localCA.crt'
if (-not (Test-Path $caKey -PathType Leaf) -or -not (Test-Path $caCrt -PathType Leaf)) {
  Write-Host 'Generating local CA...'
  openssl genrsa -out $caKey 2048 | Out-Null
  openssl req -x509 -new -nodes -key $caKey -sha256 -days 3650 -out $caCrt -subj "/CN=Notety Local CA" | Out-Null
}

# Create SAN config for the server cert
$san = ($Hosts -split ',') | ForEach-Object {
  if ($_ -match '^[0-9.]+$') { "IP = $_" } else { "DNS = $_" }
} | Out-String

$tmp = New-TemporaryFile
@"
[ req ]
distinguished_name = dn
prompt = no
x509_extensions = v3_req
[ dn ]
CN = notety.local
[ v3_req ]
subjectAltName = @alt_names
[ alt_names ]
$san
"@ | Set-Content -Path $tmp -Encoding ascii

# Generate server key/csr/cert
$serverKey = Join-Path $certsDir 'server.key'
$serverCsr = Join-Path $certsDir 'server.csr'
$serverCrt = Join-Path $certsDir 'server.crt'

Write-Host 'Generating server key and CSR...'
openssl genrsa -out $serverKey 2048 | Out-Null
openssl req -new -key $serverKey -out $serverCsr -subj "/CN=notety.local" -config $tmp | Out-Null

Write-Host 'Signing server certificate with local CA...'
openssl x509 -req -in $serverCsr -CA $caCrt -CAkey $caKey -CAcreateserial -out $serverCrt -days 825 -sha256 -extensions v3_req -extfile $tmp | Out-Null

# Export CA to trust folder
Copy-Item $caCrt (Join-Path $trustDir 'notety-local-ca.crt') -Force

Remove-Item $serverCsr,$tmp -Force

Write-Host "Done. Created:`n  $serverCrt`n  $serverKey`nCA to trust on clients:`n  $(Join-Path $trustDir 'notety-local-ca.crt')"
