# Read-only Etherscan balance checker

## What it does

Queries the native coin balance of an EVM address through Etherscan API V2. It does not transfer funds, initiate withdrawals, or query ERC-20 token balances.

## Requirements

- Node.js 18 or newer (built-in `fetch`)
- An Etherscan API key
- An EVM address you want to inspect

## Run

Set environment variables in your local terminal (do not commit API keys):

```bash
export ETHERSCAN_API_KEY='YOUR_API_KEY'
export ADDRESS='0xYourWalletAddress'
export CHAIN_ID='56' # BNB Smart Chain; use 1 for Ethereum
node scripts/etherscan-balance.mjs
```

The response reports the chain ID, address, raw wei value, and converted native coin balance. On BNB Smart Chain, the native coin is BNB; on Ethereum, it is ETH. `ADDRESS` must be a wallet/account address, not a token contract address unless you intentionally want to inspect the contract account's own native coin balance.

## Security

Never put seed phrases or private keys in this script, GitHub, or chat. Keep `ETHERSCAN_API_KEY` in a local environment variable or secret manager. The script is read-only.

## Limitations

- This endpoint reports native coin balance only.
- It does not report CRF or other ERC-20 token balances.
- It does not establish whether tokens are liquid, transferable, or withdrawable.
- Verify that the selected chain ID matches the network where the address is used.
