import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const packages = [
  { name: "Backend", example: "packages/backend/.env.example", env: "packages/backend/.env" },
  { name: "App", example: "packages/app/.env.local.example", env: "packages/app/.env.local" },
];

let allValid = true;

for (const pkg of packages) {
  const examplePath = resolve(root, pkg.example);
  const envPath = resolve(root, pkg.env);

  if (!existsSync(examplePath)) {
    console.log(`[SKIP] ${pkg.name}: no .env.example found at ${pkg.example}`);
    continue;
  }

  const exampleContent = readFileSync(examplePath, "utf-8");
  const requiredVars = exampleContent
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split("=")[0].trim())
    .filter(Boolean);

  if (requiredVars.length === 0) {
    console.log(`[SKIP] ${pkg.name}: no variables defined in ${pkg.example}`);
    continue;
  }

  if (!existsSync(envPath)) {
    console.log(`[FAIL] ${pkg.name}: ${pkg.env} not found`);
    console.log(`       Create it: cp ${pkg.example} ${pkg.env}`);
    allValid = false;
    continue;
  }

  const envContent = readFileSync(envPath, "utf-8");
  const definedVars = envContent
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split("=")[0].trim())
    .filter(Boolean);

  const missing = requiredVars.filter((v) => !definedVars.includes(v));

  if (missing.length > 0) {
    console.log(`[FAIL] ${pkg.name}: missing variables in ${pkg.env}`);
    for (const v of missing) {
      console.log(`       - ${v}`);
    }
    allValid = false;
  } else {
    console.log(`[PASS] ${pkg.name}: all ${requiredVars.length} variables present`);
  }
}

if (!allValid) {
  console.log("\nSome environment files are incomplete. Fix the issues above.");
  process.exit(1);
}

console.log("\nAll environment files are valid.");
