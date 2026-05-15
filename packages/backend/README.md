# veda-backend

Fastify + TypeScript hybrid backend for the Veda RWA platform.

## Stack
- **Fastify** — HTTP server
- **PostgreSQL** — KYC/AML investor records, assets, transactions
- **Stellar SDK** — sign and submit on-chain transactions
- **Zod** — request validation
- **JWT** — admin route auth

## Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| POST | `/kyc/register` | — | Register investor |
| GET | `/kyc/:address` | — | Get KYC status |
| PATCH | `/kyc/status` | JWT | Update KYC/AML status |
| GET | `/assets` | — | List active assets |
| GET | `/assets/:id` | — | Get asset by ID |
| POST | `/assets` | JWT | Create asset |
| PATCH | `/assets/:id/value` | JWT | Update asset valuation |
| GET | `/stellar/account/:address` | — | Fetch Stellar account balances |
| POST | `/stellar/transfer` | JWT | Submit KYC-gated transfer |

## Setup

```bash
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, STELLAR_ADMIN_SECRET

npm install
npm run db:migrate
npm run dev
```
