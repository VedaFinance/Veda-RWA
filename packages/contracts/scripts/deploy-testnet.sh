#!/usr/bin/env bash
# Deploy all Soroban contracts to a Stellar testnet.
# Prerequisites: stellar CLI installed, funded identity configured as "default".
set -euo pipefail

NETWORK="${1:-testnet}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTRACTS_DIR="$(dirname "$SCRIPT_DIR")"

cd "$CONTRACTS_DIR"

echo "=== Veda RWA — Testnet Deployment ==="
echo "Network: $NETWORK"
echo ""

CONTRACTS=(compliance asset-registry rwa-token vault)

declare -A ADDRESSES

for CONTRACT in "${CONTRACTS[@]}"; do
  WASM="target/wasm32-unknown-unknown/release/$(echo "$CONTRACT" | tr '-' '_').wasm"
  echo "Deploying $CONTRACT..."

  ADDR=$(stellar contract deploy \
    --wasm "$WASM" \
    --network "$NETWORK" \
    --source default \
    2>&1 | tail -1)

  ADDRESSES[$CONTRACT]="$ADDR"
  echo "  → $ADDR"
done

echo ""
echo "=== Deployed Addresses ==="
for CONTRACT in "${CONTRACTS[@]}"; do
  printf "  %-18s %s\n" "$CONTRACT:" "${ADDRESSES[$CONTRACT]}"
done

# Save addresses to a JSON file for reference
cat <<EOF > .soroban/deployed-testnet.json
{
  "network": "$NETWORK",
  "contracts": {
$(for CONTRACT in "${CONTRACTS[@]}"; do
  printf '    "%s": "%s"\n' "$CONTRACT" "${ADDRESSES[$CONTRACT]}"
done | paste -sd, - | sed 's/,/,\n/g')
  }
}
EOF

echo ""
echo "Addresses saved to .soroban/deployed-testnet.json"
