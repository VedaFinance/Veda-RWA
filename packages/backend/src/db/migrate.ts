import 'dotenv/config'
import { sql } from './client'

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS investors (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      stellar_address TEXT UNIQUE NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      kyc_status  TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
      aml_status  TEXT NOT NULL DEFAULT 'pending',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS assets (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id    TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      asset_type  TEXT NOT NULL,
      total_value BIGINT NOT NULL DEFAULT 0,
      token_contract TEXT,
      active      BOOLEAN NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      investor_id UUID REFERENCES investors(id),
      asset_id    TEXT NOT NULL,
      tx_type     TEXT NOT NULL,  -- deposit | withdraw | transfer
      amount      BIGINT NOT NULL,
      stellar_tx_hash TEXT,
      status      TEXT NOT NULL DEFAULT 'pending',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  console.log('Migrations complete')
  await sql.end()
}

migrate().catch((e) => { console.error(e); process.exit(1) })
