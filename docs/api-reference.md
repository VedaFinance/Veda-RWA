# Veda RWA API Reference

Base URL: `http://localhost:3001` (default)

---

## Health

### `GET /health`

Returns a simple health-check response.

**Response `200`**
```json
{ "status": "ok" }
```

---

## KYC / AML

### `POST /kyc/register`

Register a new investor for KYC/AML processing.

**Request Body**
```json
{
  "stellar_address": "GA7QNFHDH73F7X7YD5C5FZ7Q7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7",
  "email": "alice@example.com"
}
```

**Responses**
| Status | Description |
|---|---|
| `200` | Investor created or already exists |
| `409` | Address already registered |

---

### `GET /kyc/:address`

Get the KYC/AML status for a Stellar address.

**Response `200`**
```json
{
  "id": "uuid",
  "stellar_address": "G...",
  "email": "alice@example.com",
  "kyc_status": "pending",
  "aml_status": "approved",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

**Responses**
| Status | Description |
|---|---|
| `200` | Investor record |
| `404` | Address not found |

---

### `PATCH /kyc/status`

Update an investor's KYC/AML status. **Requires JWT auth.**

**Request Body**
```json
{
  "stellar_address": "G...",
  "kyc_status": "approved",
  "aml_status": "approved"
}
```

`kyc_status` / `aml_status` values: `pending | approved | rejected`

**Responses**
| Status | Description |
|---|---|
| `200` | Updated investor record |
| `401` | Missing or invalid JWT |
| `404` | Address not found |

---

## Assets

### `GET /assets`

List all active assets.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "asset_id": "us-tbill-001",
    "name": "US Treasury Bill Series Q1",
    "asset_type": "treasury-bill",
    "total_value": 5000000000,
    "token_contract": null,
    "active": true,
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

---

### `GET /assets/:id`

Get an asset by its `asset_id` string.

**Response `200`**
```json
{
  "id": "uuid",
  "asset_id": "us-tbill-001",
  "name": "US Treasury Bill Series Q1",
  "asset_type": "treasury-bill",
  "total_value": 5000000000,
  "token_contract": null,
  "active": true,
  "created_at": "2026-01-01T00:00:00Z"
}
```

**Responses**
| Status | Description |
|---|---|
| `200` | Asset found |
| `404` | Asset not found |

---

### `POST /assets`

Create a new asset. **Requires JWT auth.**

**Request Body**
```json
{
  "asset_id": "us-tbill-001",
  "name": "US Treasury Bill Series Q1",
  "asset_type": "treasury-bill",
  "total_value": 5000000000,
  "token_contract": "CA3D..."
}
```

**Responses**
| Status | Description |
|---|---|
| `201` | Asset created |
| `401` | Missing or invalid JWT |

---

### `PATCH /assets/:id/value`

Update an asset's total valuation. **Requires JWT auth.**

**Request Body**
```json
{
  "total_value": 5500000000
}
```

**Responses**
| Status | Description |
|---|---|
| `200` | Updated asset |
| `401` | Missing or invalid JWT |
| `404` | Asset not found |

---

## Stellar

### `GET /stellar/account/:address`

Fetch Stellar account details (ID, balances) from the Horizon server.

**Response `200`**
```json
{
  "id": "G...",
  "balances": [
    { "asset_type": "native", "balance": "100.0000000" }
  ]
}
```

**Responses**
| Status | Description |
|---|---|
| `200` | Account data |
| `404` | Account not funded or not found |

---

### `POST /stellar/transfer`

Submit a KYC-gated transfer. **Requires JWT auth.**

**Request Body**
```json
{
  "from": "G...",
  "to": "G...",
  "asset_code": "USDC",
  "asset_issuer": "GA...",
  "amount": "100.0000000"
}
```

**Response `200`**
```json
{
  "hash": "a1b2c3d4..."
}
```

**Responses**
| Status | Description |
|---|---|
| `200` | Transfer submitted |
| `401` | Missing or invalid JWT |
| `403` | Sender or recipient not KYC/AML approved |

---

## Error Format

All error responses follow this structure:

```json
{
  "error": "Human-readable error message"
}
```
