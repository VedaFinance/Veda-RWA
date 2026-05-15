# Veda RWA — Security Model

## Overview

Veda RWA is an institutional-grade Real-World Asset platform built on the
Stellar Network. This document outlines the security architecture, threat
model, and operational best practices.

## Smart Contract Security

### Compliance Gate

All token transfers in the `rwa-token` contract call the `compliance`
contract's `check` function. This ensures every transfer — whether a
direct `transfer`, `transfer_from`, or vault operation — enforces
KYC/AML whitelist checks **before** any balance mutation.

If either the sender or recipient is not whitelisted, the transaction
reverts at the contract layer. This is a hard on-chain guarantee that
cannot be bypassed by the off-chain backend.

### Access Control

Each contract has a single **admin** address set during `initialize`:

| Contract | Admin Authority |
|---|---|
| `compliance` | Whitelist/un-whitelist addresses |
| `asset-registry` | Register assets, update valuations, toggle active status |
| `rwa-token` | Mint new tokens, update compliance contract address |
| `vault` | Inject yield via `distribute_yield` |

All admin-gated functions call `require_auth()`, which enforces that
the admin address signed the Soroban invocation.

### Upgrade & Admin Keys

Admin keys must be held in a **multisig** configuration (e.g. Stellar
`sponsored` account or hardware-backed). A single compromised admin
key would allow an attacker to:

- Remove compliance checks
- Mint unlimited tokens
- Steal vault assets via yield distribution

**Recommendation:** Use Stellar multisig with at least 3-of-5 signers
for all contract admin addresses in production.

## Backend Security

### JWT Authentication

Routes prefixed with `PATCH /kyc/status`, `POST /assets`,
`PATCH /assets/:id/value`, and `POST /stellar/transfer` require a
valid JWT signed with `JWT_SECRET`. The JWT secret must be:
- At least 256 bits (32 bytes) of cryptographic randomness
- Rotated quarterly
- Stored in the environment, never in the codebase

### Database

- PostgreSQL runs in a private network (not exposed to the internet)
- Connection string uses `DATABASE_URL` with TLS enforced
- Migrations are idempotent and run at deploy time
- No secrets or PII are stored in plaintext (email is the only PII)

### Stellar Integration

- The backend's `STELLAR_ADMIN_SECRET` is a **hot wallet** key pair.
  It should hold only enough XLM to cover transaction fees.
- All outbound transfers first verify KYC/AML status for both sender
  and recipient via the database before signing.
- In a production setting, consider using a Hardware Security Module
  (HSM) or threshold signing to protect the admin secret.

## Frontend Security

- The Next.js app communicates exclusively with the backend API.
- No secret keys are stored in the browser.
- Wallet interaction uses the Freighter browser extension (not a
  custom in-page key manager).
- All pages are rendered with strict Content Security Policy headers.

## Threat Model

| Threat | Mitigation |
|---|---|
| Compromised admin key | Multisig, hardware-backed keys, rotation |
| Reentrancy in vault | Use `withdraw` pattern: deduct shares before transferring assets |
| Compliance bypass | On-chain check on every transfer — cannot be skipped |
| Rogue backend operator | JWT auth, database audit logs, read-only replicas |
| Frontend XSS | CSP headers, no `dangerouslySetInnerHTML`, sanitized inputs |
| Insecure dependencies | Dependabot + weekly npm audit |

## Operational Security

1. **Secrets** — Never commit `.env` files. Rotate secrets quarterly.
2. **Audit Logs** — All admin operations (KYC status changes, asset
   creation, valuation updates) should be logged with a timestamp and
   actor identity.
3. **Monitoring** — Set up alerts for:
   - Failed JWT auth attempts (possible brute force)
   - Unusual `mint` / `distribute_yield` activity on-chain
   - Rapid whitelist changes
4. **Incident Response** — If a compromise is detected:
   1. Rotate all backend secrets
   2. Transfer admin multisig to a new set of keys
   3. Freeze the compliance contract (remove all whitelisted addresses)
   4. Investigate and reconcile on-chain state
