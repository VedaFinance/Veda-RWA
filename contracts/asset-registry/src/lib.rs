//! Asset Registry — on-chain registry of tokenized real-world assets.
//! Stores asset metadata and links each asset to its rwa-token contract.

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct AssetInfo {
    pub name: String,
    pub asset_type: String,   // e.g. "real-estate", "treasury-bill", "private-credit"
    pub issuer: Address,
    pub token: Address,       // rwa-token contract
    pub total_value: i128,    // USD cents
    pub active: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Asset(String),            // asset_id -> AssetInfo
    AssetIds,                 // Vec<String> index
}

#[contract]
pub struct AssetRegistry;

#[contractimpl]
impl AssetRegistry {
    pub fn initialize(env: Env, admin: Address) {
        assert!(!env.storage().instance().has(&DataKey::Admin), "already init");
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::AssetIds, &Vec::<String>::new(&env));
    }

    pub fn register(
        env: Env,
        asset_id: String,
        name: String,
        asset_type: String,
        issuer: Address,
        token: Address,
        total_value: i128,
    ) {
        Self::require_admin(&env);
        assert!(
            !env.storage().persistent().has(&DataKey::Asset(asset_id.clone())),
            "asset already registered"
        );
        let info = AssetInfo { name, asset_type, issuer, token, total_value, active: true };
        env.storage()
            .persistent()
            .set(&DataKey::Asset(asset_id.clone()), &info);

        let mut ids: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::AssetIds)
            .unwrap();
        ids.push_back(asset_id);
        env.storage().instance().set(&DataKey::AssetIds, &ids);
    }

    pub fn update_value(env: Env, asset_id: String, total_value: i128) {
        Self::require_admin(&env);
        let mut info: AssetInfo = env
            .storage()
            .persistent()
            .get(&DataKey::Asset(asset_id.clone()))
            .expect("asset not found");
        info.total_value = total_value;
        env.storage().persistent().set(&DataKey::Asset(asset_id), &info);
    }

    pub fn set_active(env: Env, asset_id: String, active: bool) {
        Self::require_admin(&env);
        let mut info: AssetInfo = env
            .storage()
            .persistent()
            .get(&DataKey::Asset(asset_id.clone()))
            .expect("asset not found");
        info.active = active;
        env.storage().persistent().set(&DataKey::Asset(asset_id), &info);
    }

    pub fn get(env: Env, asset_id: String) -> AssetInfo {
        env.storage()
            .persistent()
            .get(&DataKey::Asset(asset_id))
            .expect("asset not found")
    }

    pub fn list(env: Env) -> Vec<String> {
        env.storage().instance().get(&DataKey::AssetIds).unwrap()
    }

    fn require_admin(env: &Env) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
    }
}
