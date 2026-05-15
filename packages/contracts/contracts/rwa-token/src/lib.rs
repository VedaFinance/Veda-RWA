//! RWA Token — SEP-41 compliant token representing a tokenized real-world asset.
//! Supports minting (admin only), burning, transfers with compliance checks,
//! and on-chain metadata (asset_id linking to the asset-registry).

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

// ── Storage keys ────────────────────────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    Admin,
    Compliance,   // compliance contract address
    AssetId,      // identifier in asset-registry
    Name,
    Symbol,
    Decimals,
    Balance(Address),
    TotalSupply,
    Allowance(Address, Address),
}

// ── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct RwaToken;

#[contractimpl]
impl RwaToken {
    /// One-time initializer.
    pub fn initialize(
        env: Env,
        admin: Address,
        compliance: Address,
        asset_id: String,
        name: String,
        symbol: Symbol,
        decimals: u32,
    ) {
        assert!(!env.storage().instance().has(&DataKey::Admin), "already init");
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Compliance, &compliance);
        env.storage().instance().set(&DataKey::AssetId, &asset_id);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
        env.storage().instance().set(&DataKey::TotalSupply, &0_i128);
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    pub fn mint(env: Env, to: Address, amount: i128) {
        Self::require_admin(&env);
        assert!(amount > 0, "amount must be positive");
        let bal = Self::balance_of(&env, &to);
        env.storage().persistent().set(&DataKey::Balance(to), &(bal + amount));
        let supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        env.storage().instance().set(&DataKey::TotalSupply, &(supply + amount));
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "amount must be positive");
        let bal = Self::balance_of(&env, &from);
        assert!(bal >= amount, "insufficient balance");
        env.storage().persistent().set(&DataKey::Balance(from), &(bal - amount));
        let supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        env.storage().instance().set(&DataKey::TotalSupply, &(supply - amount));
    }

    pub fn set_compliance(env: Env, compliance: Address) {
        Self::require_admin(&env);
        env.storage().instance().set(&DataKey::Compliance, &compliance);
    }

    // ── SEP-41 token interface ───────────────────────────────────────────────

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        Self::check_compliance(&env, &from, &to);
        let from_bal = Self::balance_of(&env, &from);
        assert!(from_bal >= amount, "insufficient balance");
        env.storage().persistent().set(&DataKey::Balance(from), &(from_bal - amount));
        let to_bal = Self::balance_of(&env, &to);
        env.storage().persistent().set(&DataKey::Balance(to), &(to_bal + amount));
    }

    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        Self::check_compliance(&env, &from, &to);
        let allowance = Self::allowance_of(&env, &from, &spender);
        assert!(allowance >= amount, "insufficient allowance");
        env.storage()
            .persistent()
            .set(&DataKey::Allowance(from.clone(), spender.clone()), &(allowance - amount));
        let from_bal = Self::balance_of(&env, &from);
        assert!(from_bal >= amount, "insufficient balance");
        env.storage().persistent().set(&DataKey::Balance(from), &(from_bal - amount));
        let to_bal = Self::balance_of(&env, &to);
        env.storage().persistent().set(&DataKey::Balance(to), &(to_bal + amount));
    }

    pub fn approve(env: Env, owner: Address, spender: Address, amount: i128) {
        owner.require_auth();
        env.storage()
            .persistent()
            .set(&DataKey::Allowance(owner, spender), &amount);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    pub fn balance(env: Env, account: Address) -> i128 {
        Self::balance_of(&env, &account)
    }

    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        Self::allowance_of(&env, &owner, &spender)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).unwrap()
    }

    pub fn symbol(env: Env) -> Symbol {
        env.storage().instance().get(&DataKey::Symbol).unwrap()
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap()
    }

    pub fn asset_id(env: Env) -> String {
        env.storage().instance().get(&DataKey::AssetId).unwrap()
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    fn require_admin(env: &Env) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
    }

    fn balance_of(env: &Env, account: &Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(account.clone()))
            .unwrap_or(0)
    }

    fn allowance_of(env: &Env, owner: &Address, spender: &Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Allowance(owner.clone(), spender.clone()))
            .unwrap_or(0)
    }

    fn check_compliance(env: &Env, from: &Address, to: &Address) {
        let compliance: Address = env.storage().instance().get(&DataKey::Compliance).unwrap();
        env.invoke_contract::<()>(
            &compliance,
            &symbol_short!("check"),
            soroban_sdk::vec![env, from.into_val(env), to.into_val(env)],
        );
    }
}
