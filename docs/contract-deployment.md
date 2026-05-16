# Contract Deployment Guide

This guide explains how to build, deploy, and initialize the four Soroban
smart contracts that make up the Veda RWA platform.

## Prerequisites

- **Rust** with `wasm32-unknown-unknown` target
- **Stellar CLI** (`cargo install --locked stellar-cli`)
- Funded Stellar identity configured as `default`:
  ```bash
  stellar keys generate default --network testnet
  stellar keys fund default --network testnet
  ```

## Build

```bash
cd packages/contracts
make wasm
```

This produces four `.wasm` files under
`target/wasm32-unknown-unknown/release/`:
- `compliance.wasm`
- `asset_registry.wasm`
- `rwa_token.wasm`
- `vault.wasm`

## Deploy

### Option A — Automated script

```bash
bash packages/contracts/scripts/deploy-testnet.sh
```

### Option B — Manual deployment per contract

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/compliance.wasm \
  --network testnet \
  --source default
```

Repeat for each contract. Note the returned contract addresses.

## Initialize

After deployment, each contract must be initialized by invoking its
`initialize` function.

### 1. Compliance

```bash
stellar contract invoke \
  --id <COMPLIANCE_ADDR> \
  --network testnet \
  --source default \
  -- \
  initialize \
  --admin <ADMIN_ADDRESS>
```

### 2. Asset Registry

```bash
stellar contract invoke \
  --id <ASSET_REGISTRY_ADDR> \
  --network testnet \
  --source default \
  -- \
  initialize \
  --admin <ADMIN_ADDRESS>
```

### 3. RWA Token

```bash
stellar contract invoke \
  --id <RWA_TOKEN_ADDR> \
  --network testnet \
  --source default \
  -- \
  initialize \
  --admin <ADMIN_ADDRESS> \
  --compliance <COMPLIANCE_ADDR> \
  --asset_id "us-tbill-001" \
  --name "US Treasury Bill Series Q1" \
  --symbol "usd" \
  --decimals 7
```

### 4. Vault

```bash
stellar contract invoke \
  --id <VAULT_ADDR> \
  --network testnet \
  --source default \
  -- \
  initialize \
  --admin <ADMIN_ADDRESS> \
  --underlying <USDC_CONTRACT_ADDR>
```

## Wiring

1. Register the RWA token's asset ID in the asset registry:

```bash
stellar contract invoke \
  --id <ASSET_REGISTRY_ADDR> \
  --network testnet \
  --source default \
  -- \
  register \
  --asset_id "us-tbill-001" \
  --name "US Treasury Bill Series Q1" \
  --asset_type "treasury-bill" \
  --issuer <ADMIN_ADDRESS> \
  --token <RWA_TOKEN_ADDR> \
  --total_value 5000000000
```

2. Whitelist an investor address in compliance:

```bash
stellar contract invoke \
  --id <COMPLIANCE_ADDR> \
  --network testnet \
  --source default \
  -- \
  set_status \
  --account <INVESTOR_ADDRESS> \
  --approved true
```

## Verify

Check that the contract is responding:

```bash
stellar contract invoke \
  --id <COMPLIANCE_ADDR> \
  --network testnet \
  --source default \
  -- \
  is_approved \
  --account <INVESTOR_ADDRESS>
```

Expected output: `true`
