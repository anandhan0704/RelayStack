#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-relaystack.local}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MTA_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
KEYGEN="${MTA_ROOT}/../../node_modules/haraka-plugin-dkim/config/dkim_key_gen.sh"
TARGET_DIR="${MTA_ROOT}/config/dkim/${DOMAIN}"

if [[ ! -f "${KEYGEN}" ]]; then
  echo "Run npm install from the repo root first." >&2
  exit 1
fi

mkdir -p "${MTA_ROOT}/config/dkim"
(
  cd "${MTA_ROOT}/config/dkim"
  bash "${KEYGEN}" "${DOMAIN}"
)

echo
echo "DKIM keys generated for ${DOMAIN} in ${TARGET_DIR}"
echo "Publish the TXT record from:"
echo "  ${TARGET_DIR}/dns"
echo
echo "Also publish SPF and DMARC for public inbox delivery:"
echo "  ${DOMAIN}.  TXT  \"v=spf1 a mx ip4:<your-sending-ip> -all\""
echo "  _dmarc.${DOMAIN}.  TXT  \"v=DMARC1; p=none; rua=mailto:dmarc@${DOMAIN}\""
