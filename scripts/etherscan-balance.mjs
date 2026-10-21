#!/usr/bin/env node
/**
 * Read-only native balance checker using Etherscan API V2.
 *
 * Required environment variables:
 *   ETHERSCAN_API_KEY  Your Etherscan API key (never commit it)
 *   ADDRESS            0x-prefixed EVM address to inspect
 *
 * Optional:
 *   CHAIN_ID           Defaults to 56 (BNB Smart Chain). Use 1 for Ethereum.
 *
 * This reads the address's native coin balance only (e.g. BNB on chain 56,
 * ETH on chain 1). It does not read CRF/ERC-20 token balances and cannot
 * transfer or withdraw funds.
 */
const apiKey = process.env.ETHERSCAN_API_KEY;
const address = process.env.ADDRESS;
const chainId = process.env.CHAIN_ID || "56";

if (!apiKey) {
  console.error("Missing ETHERSCAN_API_KEY environment variable.");
  process.exit(1);
}
if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
  console.error("Set ADDRESS to a valid 0x-prefixed 20-byte EVM address.");
  process.exit(1);
}
if (!/^\d+$/.test(chainId)) {
  console.error("CHAIN_ID must be a numeric chain ID (e.g. 56 or 1).");
  process.exit(1);
}

const url = new URL("https://api.etherscan.io/v2/api");
url.search = new URLSearchParams({
  chainid: chainId,
  module: "account",
  action: "balance",
  address,
  tag: "latest",
  apikey: apiKey,
}).toString();

try {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();

  if (data.status !== "1" || typeof data.result !== "string" || !/^\d+$/.test(data.result)) {
    throw new Error(data.result || data.message || "Unexpected API response");
  }

  const wei = BigInt(data.result);
  const divisor = 10n ** 18n;
  const whole = wei / divisor;
  const fraction = (wei % divisor).toString().padStart(18, "0").replace(/0+$/, "");
  const balance = fraction ? `${whole}.${fraction}` : whole.toString();

  console.log(JSON.stringify({
    source: "Etherscan API V2",
    chainId,
    address,
    tag: "latest",
    rawWei: data.result,
    nativeBalance: balance,
    note: "Native coin balance only; not an ERC-20 token balance or a withdrawal confirmation.",
  }, null, 2));
} catch (error) {
  console.error(`Balance query failed: ${error.message}`);
  process.exit(1);
}
