NETWORK ?= testnet
CONTRACTS = compliance asset-registry rwa-token vault

.PHONY: build test clean deploy-all fmt

build:
	cargo build --release --target wasm32-unknown-unknown

test:
	cargo test

fmt:
	cargo fmt --all

clean:
	cargo clean

# Build optimised .wasm for each contract
wasm:
	@for c in $(CONTRACTS); do \
		echo "Building $$c..."; \
		cargo build --release --target wasm32-unknown-unknown -p $$c; \
	done

# Deploy all contracts to $NETWORK (requires stellar CLI + funded identity)
deploy-all: wasm
	@for c in $(CONTRACTS); do \
		echo "Deploying $$c to $(NETWORK)..."; \
		stellar contract deploy \
			--wasm target/wasm32-unknown-unknown/release/$$(echo $$c | tr '-' '_').wasm \
			--network $(NETWORK) \
			--source default; \
	done
