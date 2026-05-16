import "dotenv/config";
import { sql } from "./client";

const SEED_INVESTORS = [
  { stellar_address: "GA7QNFHDH73F7X7YD5C5FZ7Q7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7", email: "alice@veda.finance" },
  { stellar_address: "GB4RNFHDH73F7X7YD5C5FZ7Q7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7", email: "bob@veda.finance" },
  { stellar_address: "GC3PNFHDH73F7X7YD5C5FZ7Q7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7", email: "carol@veda.finance" },
];

const SEED_ASSETS = [
  {
    asset_id: "us-tbill-001",
    name: "US Treasury Bill Series Q1",
    asset_type: "treasury-bill",
    total_value: 50_000_000_00,
    token_contract: null,
  },
  {
    asset_id: "ny-cre-001",
    name: "NY Commercial Real Estate Fund",
    asset_type: "real-estate",
    total_value: 120_000_000_00,
    token_contract: null,
  },
  {
    asset_id: "pc-credit-001",
    name: "Private Credit Pool A",
    asset_type: "private-credit",
    total_value: 25_000_000_00,
    token_contract: null,
  },
];

async function seed() {
  console.log("Seeding investors...");
  for (const inv of SEED_INVESTORS) {
    await sql`
      INSERT INTO investors (stellar_address, email, kyc_status, aml_status)
      VALUES (${inv.stellar_address}, ${inv.email}, 'approved', 'approved')
      ON CONFLICT (stellar_address) DO NOTHING
    `;
  }

  console.log("Seeding assets...");
  for (const asset of SEED_ASSETS) {
    await sql`
      INSERT INTO assets (asset_id, name, asset_type, total_value, token_contract, active)
      VALUES (${asset.asset_id}, ${asset.name}, ${asset.asset_type}, ${asset.total_value}, ${asset.token_contract}, true)
      ON CONFLICT (asset_id) DO NOTHING
    `;
  }

  console.log("Seed complete.");
  await sql.end();
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
