//! Vault — institutional custody vault for RWA tokens.
//! Investors deposit an underlying asset (e.g. USDC) and receive vault shares.
//! Admin distributes yield; investors redeem shares for underlying + yield.

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    Underlying,           // underlying token contract (e.g. USDC)
    TotalShares,
    TotalAssets,
    Shares(Address),
}

#[contract]
pub struct Vault;

#[contractimpl]
impl Vault {
    pub fn initialize(env: Env, admin: Address, underlying: Address) {
        assert!(!env.storage().instance().has(&DataKey::Admin), "already init");
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Underlying, &underlying);
        env.storage().instance().set(&DataKey::TotalShares, &0_i128);
        env.storage().instance().set(&DataKey::TotalAssets, &0_i128);
    }

    /// Deposit `amount` of underlying, receive proportional shares.
    pub fn deposit(env: Env, investor: Address, amount: i128) -> i128 {
        investor.require_auth();
        assert!(amount > 0, "amount must be positive");

        let underlying: Address = env.storage().instance().get(&DataKey::Underlying).unwrap();
        // Transfer underlying from investor to vault
        env.invoke_contract::<()>(
            &underlying,
            &symbol_short!("transfer"),
            soroban_sdk::vec![
                &env,
                investor.clone().into_val(&env),
                env.current_contract_address().into_val(&env),
                amount.into_val(&env),
            ],
        );

        let shares = Self::calc_shares(&env, amount);
        let investor_shares = Self::shares_of(&env, &investor);
        env.storage()
            .persistent()
            .set(&DataKey::Shares(investor.clone()), &(investor_shares + shares));

        let total_shares: i128 = env.storage().instance().get(&DataKey::TotalShares).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TotalShares, &(total_shares + shares));

        let total_assets: i128 = env.storage().instance().get(&DataKey::TotalAssets).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TotalAssets, &(total_assets + amount));

        shares
    }

    /// Redeem `shares` for underlying assets.
    pub fn withdraw(env: Env, investor: Address, shares: i128) -> i128 {
        investor.require_auth();
        assert!(shares > 0, "shares must be positive");

        let investor_shares = Self::shares_of(&env, &investor);
        assert!(investor_shares >= shares, "insufficient shares");

        let amount = Self::calc_assets(&env, shares);

        env.storage()
            .persistent()
            .set(&DataKey::Shares(investor.clone()), &(investor_shares - shares));

        let total_shares: i128 = env.storage().instance().get(&DataKey::TotalShares).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TotalShares, &(total_shares - shares));

        let total_assets: i128 = env.storage().instance().get(&DataKey::TotalAssets).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TotalAssets, &(total_assets - amount));

        let underlying: Address = env.storage().instance().get(&DataKey::Underlying).unwrap();
        env.invoke_contract::<()>(
            &underlying,
            &symbol_short!("transfer"),
            soroban_sdk::vec![
                &env,
                env.current_contract_address().into_val(&env),
                investor.into_val(&env),
                amount.into_val(&env),
            ],
        );

        amount
    }

    /// Admin injects yield by increasing total_assets without minting shares.
    pub fn distribute_yield(env: Env, amount: i128) {
        Self::require_admin(&env);
        assert!(amount > 0, "amount must be positive");
        let total_assets: i128 = env.storage().instance().get(&DataKey::TotalAssets).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TotalAssets, &(total_assets + amount));
    }

    // ── Views ────────────────────────────────────────────────────────────────

    pub fn shares(env: Env, investor: Address) -> i128 {
        Self::shares_of(&env, &investor)
    }

    pub fn total_shares(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalShares).unwrap_or(0)
    }

    pub fn total_assets(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalAssets).unwrap_or(0)
    }

    /// Current value of one share in underlying units.
    pub fn share_price(env: Env) -> i128 {
        let total_shares: i128 = env.storage().instance().get(&DataKey::TotalShares).unwrap_or(0);
        if total_shares == 0 {
            return 1_000_000; // 1:1 initial price (6 decimals)
        }
        let total_assets: i128 = env.storage().instance().get(&DataKey::TotalAssets).unwrap_or(0);
        total_assets * 1_000_000 / total_shares
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    fn require_admin(env: &Env) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
    }

    fn shares_of(env: &Env, investor: &Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Shares(investor.clone()))
            .unwrap_or(0)
    }

    /// assets -> shares (pro-rata)
    fn calc_shares(env: &Env, amount: i128) -> i128 {
        let total_shares: i128 = env.storage().instance().get(&DataKey::TotalShares).unwrap_or(0);
        let total_assets: i128 = env.storage().instance().get(&DataKey::TotalAssets).unwrap_or(0);
        if total_shares == 0 || total_assets == 0 {
            amount // 1:1 on first deposit
        } else {
            amount * total_shares / total_assets
        }
    }

    /// shares -> assets (pro-rata)
    fn calc_assets(env: &Env, shares: i128) -> i128 {
        let total_shares: i128 = env.storage().instance().get(&DataKey::TotalShares).unwrap_or(0);
        let total_assets: i128 = env.storage().instance().get(&DataKey::TotalAssets).unwrap_or(0);
        if total_shares == 0 {
            return 0;
        }
        shares * total_assets / total_shares
    }
}
