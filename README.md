# veda

Institutional-grade Real-World Asset (RWA) platform on the Stellar Network.

## Monorepo Structure

```
packages/
├── contracts/   # Soroban smart contracts (Rust)
├── backend/     # Fastify API + PostgreSQL + Stellar SDK (TypeScript)
└── app/         # Next.js 14 dashboard + Freighter wallet (TypeScript)
```

## Architecture

```
investor ──► app ──► backend ──► contracts (on-chain)
                        │
                  PostgreSQL (KYC/AML)
```

## Contracts

| Contract | Description |
|---|---|
| `compliance` | KYC/AML whitelist — gates all token transfers |
| `asset-registry` | On-chain registry of tokenized real-world assets |
| `rwa-token` | SEP-41 token representing a single RWA |
| `vault` | Custody vault — deposit USDC, receive yield-bearing shares |

## Quick Start

```bash
# Contracts (requires Rust + stellar-cli)
npm run build:contracts
npm run test:contracts

# Backend
cp packages/backend/.env.example packages/backend/.env
npm run dev:backend

# Frontend
cp packages/app/.env.local.example packages/app/.env.local
npm run dev:app
```

## Setup

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli

# Install JS dependencies
npm install
```
