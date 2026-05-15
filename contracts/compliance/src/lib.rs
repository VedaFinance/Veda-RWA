//! Compliance — KYC/AML whitelist.
//! Called by rwa-token before every transfer to enforce investor eligibility.

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    Whitelisted(Address),
}

#[contract]
pub struct Compliance;

#[contractimpl]
impl Compliance {
    pub fn initialize(env: Env, admin: Address) {
        assert!(!env.storage().instance().has(&DataKey::Admin), "already init");
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Add or remove an address from the whitelist.
    pub fn set_status(env: Env, account: Address, approved: bool) {
        Self::require_admin(&env);
        env.storage()
            .persistent()
            .set(&DataKey::Whitelisted(account), &approved);
    }

    /// Called by rwa-token. Panics if either party is not whitelisted.
    pub fn check(env: Env, from: Address, to: Address) {
        assert!(Self::is_whitelisted(&env, &from), "sender not whitelisted");
        assert!(Self::is_whitelisted(&env, &to), "recipient not whitelisted");
    }

    pub fn is_approved(env: Env, account: Address) -> bool {
        Self::is_whitelisted(&env, &account)
    }

    fn require_admin(env: &Env) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
    }

    fn is_whitelisted(env: &Env, account: &Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Whitelisted(account.clone()))
            .unwrap_or(false)
    }
}
