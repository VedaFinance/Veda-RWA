# Investor Onboarding Guide

This guide walks institutional investors through the steps required to
access the Veda RWA platform: from initial registration to purchasing
tokenized real-world assets.

---

## Prerequisites

1. **Stellar wallet** — Install the
   [Freighter](https://freighter.app) browser extension and create or
   import a Stellar wallet.
2. **Email address** — Used for KYC/AML correspondence.
3. **USDC** — Fund your Stellar wallet with USDC (testnet or mainnet,
   depending on the environment).

---

## Step 1 — Connect Wallet

Navigate to the Veda dashboard and click **Connect Freighter**. Approve
the connection request in the Freighter popup. Your wallet address will
appear in the header once connected.

---

## Step 2 — Register for KYC/AML

If your address is not yet registered, a banner will appear prompting
you to contact an administrator. Send your **Stellar public key** and
**email address** to your platform administrator.

Alternatively, if self-registration is enabled, the dashboard will
present a registration form. Enter your email and submit.

**What happens next:**
- The administrator reviews your KYC documentation off-chain.
- Upon approval, your address is whitelisted in the `compliance`
  smart contract and your database record is updated.
- You will receive a confirmation email.

---

## Step 3 — Verify Status

Once connected and approved, the dashboard displays a status banner:

```
KYC: approved · AML: approved
```

If your status is `pending` or `rejected`, please contact your
administrator.

---

## Step 4 — Browse Assets

The dashboard homepage lists all available tokenized real-world assets.
Each asset card shows:

- **Asset type** (treasury-bill, real-estate, private-credit)
- **Name** — e.g. "US Treasury Bill Series Q1"
- **Total value** — in USD
- **Contract address** — the deployed `rwa-token` contract
- **Status** — Active / Inactive

---

## Step 5 — Deposit & Invest

To invest in an asset:

1. Click the asset card to view its detail page.
2. Enter the amount of USDC you wish to deposit.
3. Approve the deposit transaction in Freighter.
4. The vault contract mints proportional vault shares and credits your
   balance.

You can monitor your position on the dashboard.

---

## Step 6 — Withdraw

To redeem your investment:

1. Navigate to your portfolio or the vault section.
2. Enter the number of shares you wish to redeem.
3. Approve the withdrawal transaction in Freighter.
4. The underlying USDC (plus accrued yield) is returned to your wallet.

---

## Glossary

| Term | Definition |
|---|---|
| **Freighter** | Official Stellar browser extension wallet |
| **KYC** | Know Your Customer — identity verification |
| **AML** | Anti-Money Laundering — sanction screening |
| **RWA** | Real-World Asset — a token representing ownership of a physical or financial asset |
| **Vault** | Smart contract that accepts deposits and issues yield-bearing shares |
| **SEP-41** | Stellar Ecosystem Proposal for fungible token standards on Soroban |
| **USDC** | USD Coin — a stablecoin on the Stellar network |

---

## Support

For onboarding assistance, contact your account administrator or email
support@veda.finance.
