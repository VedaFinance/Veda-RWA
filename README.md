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
┌─────────────────────────────────────────────────────────────────────┐
│                        Investor                                    │
│              (Freighter Wallet Browser Extension)                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │ connect / sign
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  app (Next.js 14)                                                   │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │ Dashboard    │  │ Asset Cards  │  │ KYC/AML Status Banner    │  │
│  └─────────────┘  └──────────────┘  └───────────────────────────┘  │
│                                                                     │
│  API calls ─────────────────────────────────────────────────────┐   │
└─────────────────────────────────────────────────────────────────┤───┘
                                                                  │
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  backend (Fastify + TypeScript)                                     │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ KYC/AML  │  │ Assets   │  │ Stellar  │  │ JWT Auth          │  │
│  │ Routes   │  │ Routes   │  │ Routes   │  │ (admin routes)    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────────────────┘  │
│       │              │             │                                │
│       ▼              ▼             ▼                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL                                                   │  │
│  │  investors (KYC/AML status)                                   │  │
│  │  assets (metadata, valuation)                                 │  │
│  │  transactions (audit log)                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  On-chain invocations ────────────────────────────────────────┐    │
└─────────────────────────────────────────────────────────────────┤───┘
                                                                  │
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  contracts (Soroban / Stellar Network)                              │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────┐                          │
│  │  compliance   │◄───│  rwa-token       │                          │
│  │  KYC/AML      │    │  SEP-41 Token    │                          │
│  │  whitelist    │    │  checks every    │                          │
│  │               │    │  transfer with   │                          │
│  │               │    │  compliance      │                          │
│  └──────────────┘    └────────┬─────────┘                          │
│                               │                                      │
│  ┌──────────────────┐         │         ┌──────────────────┐        │
│  │  asset-registry   │         │         │  vault            │        │
│  │  RWA metadata     │         │         │  Custody vault   │        │
│  │  & token linking  │         │         │  deposit/withdraw│        │
│  └──────────────────┘         │         └──────────────────┘        │
│                               │                                      │
│                     ┌─────────▼──────────┐                          │
│                     │  compliance.check() │                          │
│                     │  guards EVERY       │                          │
│                     │  transfer           │                          │
│                     └────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Flow Legend

1. **Investor** connects their Freighter wallet to the **app**.
2. **app** fetches KYC status and asset listings from the **backend** via REST.
3. **backend** queries **PostgreSQL** for investor records and asset metadata.
4. For token transfers, the **backend** submits transactions signed by an
   admin keypair through Stellar Horizon.
5. **rwa-token** calls **compliance.check()** on-chain before every transfer.
6. If either party is not whitelisted, the transaction reverts at the
   contract layer — no off-chain bypass is possible.

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
