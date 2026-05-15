# veda-app

Next.js 14 frontend for the Veda RWA platform.

## Stack
- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Freighter API** — Stellar wallet integration
- **SWR** — data fetching
- **Stellar SDK** — transaction building

## Features
- Connect Freighter wallet
- View KYC/AML status
- Browse tokenized real-world assets
- Fractional asset dashboard

## Setup

```bash
cp .env.local.example .env.local
# set NEXT_PUBLIC_API_URL to your veda-backend URL

npm install
npm run dev
```
