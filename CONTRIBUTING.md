# Contributing to Veda RWA

Thank you for your interest in contributing! This document covers how to get set up and submit changes.

## Prerequisites

| Tool | Version |
|---|---|
| Rust | stable (via rustup) |
| wasm32 target | `rustup target add wasm32-unknown-unknown` |
| stellar-cli | `cargo install --locked stellar-cli` |
| Node.js | 20+ |
| PostgreSQL | 15+ (or use Docker) |

## Local Setup

```bash
git clone https://github.com/VedaFinance/veda-rwa
cd veda-rwa

# Start PostgreSQL
docker-compose up -d

# Install JS dependencies
npm install

# Backend
cp packages/backend/.env.example packages/backend/.env
npm run db:migrate --workspace=packages/backend

# Frontend
cp packages/app/.env.local.example packages/app/.env.local

# Run everything
npm run dev:backend   # http://localhost:3001
npm run dev:app       # http://localhost:3000

# Contracts
npm run build:contracts
npm run test:contracts
```

## Project Structure

```
packages/
├── contracts/   # Rust/Soroban smart contracts
├── backend/     # Fastify API (TypeScript)
└── app/         # Next.js 14 frontend (TypeScript)
```

## Making Changes

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes with tests where applicable
3. Ensure CI passes locally before pushing:
   - Contracts: `npm run test:contracts`
   - Backend: `npm run build:backend`
   - App: `npm run build:app`
4. Open a pull request against `main`

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Reference any related issues: `Closes #123`
- Provide a clear description of what changed and why
- Do not commit `.env` files or secrets

## Commit Style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add clawback to rwa-token
fix: correct share price calculation in vault
docs: update setup instructions
chore: bump stellar-sdk to 12.1.0
```

## Reporting Issues

Use the GitHub issue templates for bug reports and feature requests.
