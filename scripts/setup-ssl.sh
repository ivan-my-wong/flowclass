#!/usr/bin/env bash

# This script sets up Let's Encrypt certificates using Certbot for the domains
# once the DNS records have been pointed directly to this server (72.62.241.214).

set -euo pipefail

DOMAINS=("v2.app.flowclass.io" "v2.apiv3.flowclass.io" "v2.flowclass.io")
EMAIL="contact@flowclass.io"

echo "========================================================="
echo "  Flowclass SSL Setup Utility (Certbot + Nginx)"
echo "========================================================="
echo ""
echo "This script will request and configure Let's Encrypt certificates"
echo "for: ${DOMAINS[*]}"
echo ""
echo "Please make sure that the A-records for these domains have been"
echo "pointed to the VPS IP (72.62.241.214) and have fully propagated."
echo ""
read -p "Are you ready to proceed? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting without making changes."
    exit 1
fi

echo "==> Running Certbot..."
certbot --nginx --non-interactive --agree-tos --email "$EMAIL" \
  -d v2.app.flowclass.io \
  -d v2.apiv3.flowclass.io \
  -d v2.flowclass.io

echo "==> Reloading Nginx..."
systemctl reload nginx

echo "==> Done! SSL certificates have been configured successfully."
