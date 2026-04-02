# Celo Arcade USDm V3 Deployment Guide (Remix)

This version supports **updating entry fee without redeploying**.

## 1. Open Remix and paste the contract

1. Go to https://remix.ethereum.org
2. Create `CeloArcadeUSDmV3.sol`
3. Paste content from:
   - `contracts/CeloArcadeUSDmV3.sol`

## 2. Compile

1. Open **Solidity Compiler**
2. Use compiler `0.8.20` (or compatible `0.8.x`)
3. Compile `CeloArcadeUSDmV3.sol`

## 3. Connect wallet on Celo Mainnet

1. In wallet, switch to:
   - Network: **Celo Mainnet**
   - Chain ID: `42220`
2. In Remix **Deploy & Run Transactions**:
   - Environment: **Injected Provider - MetaMask**
   - Contract: `CeloArcadeUSDmV3`

## 4. Constructor parameters

V3 constructor takes 2 values:

1. `usdmTokenAddress`
2. `initialEntryFee`

Use:

1. `usdmTokenAddress`: `0x765DE816845861e75A25fCA122bb6898B8B1282a`
2. `initialEntryFee`: `100000000000000000` (0.1 USDm)

Deploy and confirm transaction.

## 5. Quick post-deploy checks in Remix

Call:

1. `usdmToken()` -> should be `0x765DE816845861e75A25fCA122bb6898B8B1282a`
2. `ENTRY_FEE()` -> should be `100000000000000000`
3. `entryFee()` -> should match `ENTRY_FEE()`
4. `MIN_ENTRY_FEE()` -> lower bound
5. `MAX_ENTRY_FEE()` -> upper bound

## 6. Wire to app

Update `.env.local`:

```bash
NEXT_PUBLIC_ARCADE_CONTRACT_ADDRESS=0xYOUR_V3_CONTRACT_ADDRESS
```

Restart app:

```bash
npm run dev
```

## 7. Change entry fee later (no redeploy)

In Remix, under deployed V3 contract:

1. Call `setEntryFee(newEntryFeeWei)` as owner
2. Example values:
   - `0.05 USDm` -> `50000000000000000`
   - `0.10 USDm` -> `100000000000000000`
   - `0.25 USDm` -> `250000000000000000`

The frontend reads `ENTRY_FEE()` on-chain at runtime, so UI/allowance checks update automatically.

## Notes

1. Only owner can call `setEntryFee`.
2. Fee must be within `[MIN_ENTRY_FEE, MAX_ENTRY_FEE]`.
3. Prize pool and creator earnings remain in USDm.
