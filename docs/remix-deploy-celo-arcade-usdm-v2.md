# Celo Arcade USDm v2 Deployment Guide (Remix)

This guide deploys the USDm-based arcade contract to **Celo Mainnet** and connects it to this app.

## 1. Open Remix and paste the contract

1. Go to https://remix.ethereum.org
2. Create a new file named `CeloArcadeUSDmV2.sol`
3. Copy the contract from:
   - `contracts/CeloArcadeUSDmV2.sol`

## 2. Compile

1. Open the **Solidity Compiler** tab
2. Set compiler to **0.8.20** (or a compatible 0.8.x version)
3. Compile `CeloArcadeUSDmV2.sol`

## 3. Connect wallet on Celo Mainnet

1. In your wallet, switch network to:
   - **Celo Mainnet**
   - Chain ID: `42220`
2. In Remix **Deploy & Run Transactions**:
   - Environment: **Injected Provider - MetaMask**
   - Contract: `CeloArcadeUSDmV2`

## 4. Deploy with constructor argument

The constructor needs the USDm token address.

- **Celo Mainnet USDm**: `0x765DE816845861e75A25fCA122bb6898B8B1282a`

Deploy by entering that address in the constructor input and confirming the transaction.

## 5. Verify quick sanity checks in Remix

After deployment, call:

1. `usdmToken()` -> should return `0x765DE816845861e75A25fCA122bb6898B8B1282a`
2. `seasonNumber()` -> should return `1`
3. `ENTRY_FEE()` -> should return `100000000000000000` (0.1 USDm)

## 6. Wire the new address into this app

Add/update `.env.local` in project root:

```bash
NEXT_PUBLIC_ARCADE_CONTRACT_ADDRESS=0xYOUR_NEW_DEPLOYED_CONTRACT
```

Then restart:

```bash
npm run dev
```

## 7. Expected user flow in app

1. Connect wallet (or auto-connect in MiniPay)
2. Click **Approve USDm** (one-time)
3. Click **Deposit & Play** (0.1 USDm)
4. Play games and submit scores
5. Top player claims USDm prize pool when cooldown allows

## Notes

1. This v2 contract does **not** accept native CELO deposits.
2. Prize pool and creator earnings are held in **USDm**.
3. In MiniPay, the app also sends transactions with `feeCurrency = USDm` for gas abstraction where supported.
