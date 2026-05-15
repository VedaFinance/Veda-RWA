# veda-contracts

Institutional-grade Real-World Asset (RWA) platform on the Stellar Network, built with Soroban smart contracts.

## Contracts

| Contract | Description |
|---|---|
| `compliance` | KYC/AML whitelist — gates all token transfers |
| `asset-registry` | On-chain registry of tokenized real-world assets |
| `rwa-token` | SEP-41 token representing a single RWA, transfer-gated by compliance |
| `vault` | Custody vault — investors deposit USDC, receive yield-bearing shares |

## Architecture

```
investor ──► vault ──► rwa-token ──► compliance
                           │
                    asset-registry
```

1. Admin registers an asset in `asset-registry` and deploys an `rwa-token` pointing to it.
2. `compliance` admin whitelists KYC-verified investors.
3. Investors deposit via `vault`; vault mints/transfers `rwa-token` shares.
4. Every `rwa-token` transfer calls `compliance.check()` — non-whitelisted addresses are blocked.
5. Admin calls `vault.distribute_yield()` to accrue returns; investors redeem shares for underlying + yield.

## Setup

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add wasm target
rustup target add wasm32-unknown-unknown

# Install Stellar CLI
cargo install --locked stellar-cli

# Build all contracts
make wasm

# Run tests
make test

# Deploy to testnet (requires funded identity)
make deploy-all NETWORK=testnet
```
