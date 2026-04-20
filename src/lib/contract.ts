import { parseUnits } from 'viem';
import CONTRACT_ABI_JSON from '../abi/CeloArcade.json';

// V4 deployed by you on Celo mainnet (USDT).
const DEFAULT_CONTRACT_ADDRESS = '0xD3Cb0357edF92E1056cfBC3dC5cC1DA52846DDB0';
const DEFAULT_STABLE_TOKEN_ADDRESS = '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e'; // USDT
const DEFAULT_STABLE_TOKEN_SYMBOL = 'USDT';
const DEFAULT_STABLE_TOKEN_DECIMALS = 6;
// MiniPay fee abstraction is typically USDm-based even if your app token is USDT.
export const DEFAULT_MINIPAY_FEE_CURRENCY = '0x765DE816845861e75A25fCA122bb6898B8B1282a';
export const CELO_CHAIN_ID = 42220;

// Set NEXT_PUBLIC_ARCADE_CONTRACT_ADDRESS to your deployed V4 contract.
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_ARCADE_CONTRACT_ADDRESS?.trim() || DEFAULT_CONTRACT_ADDRESS) as `0x${string}`;

const parsedTokenDecimals = Number.parseInt(
  process.env.NEXT_PUBLIC_STABLE_TOKEN_DECIMALS?.trim() || String(DEFAULT_STABLE_TOKEN_DECIMALS),
  10
);

export const STABLE_TOKEN_ADDRESS = (
  process.env.NEXT_PUBLIC_STABLE_TOKEN_ADDRESS?.trim() || DEFAULT_STABLE_TOKEN_ADDRESS
) as `0x${string}`;
export const STABLE_TOKEN_SYMBOL = process.env.NEXT_PUBLIC_STABLE_TOKEN_SYMBOL?.trim() || DEFAULT_STABLE_TOKEN_SYMBOL;
export const STABLE_TOKEN_DECIMALS =
  Number.isFinite(parsedTokenDecimals) && parsedTokenDecimals >= 0 && parsedTokenDecimals <= 18
    ? parsedTokenDecimals
    : DEFAULT_STABLE_TOKEN_DECIMALS;
export const MINIPAY_FEE_CURRENCY = (
  process.env.NEXT_PUBLIC_MINIPAY_FEE_CURRENCY?.trim() || DEFAULT_MINIPAY_FEE_CURRENCY
) as `0x${string}`;

// Backward-compatible export name used across the app.
export const USDM_TOKEN_ADDRESS = STABLE_TOKEN_ADDRESS;

/** Default entry fee value in human-readable stablecoin units (e.g. 0.01 USDT). */
export const DEFAULT_ENTRY_FEE_VALUE = '0.01';

/**
 * Frontend fallback entry fee.
 * Note: The app typically reads the current fee from the contract at runtime.
 */
export const ENTRY_FEE = parseUnits(DEFAULT_ENTRY_FEE_VALUE, STABLE_TOKEN_DECIMALS);

/**
 * Game type identifiers used by the smart contract.
 */
export const GameType = {
  CAR_RACE: 0,
  SNAKE: 1,
  FLAPPY: 2,
  SPACE_SHOOTER: 3,
  PUZZLE: 4,
} as const;

/**
 * Difficulty level identifiers used by the smart contract.
 */
export const Difficulty = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
} as const;

export const CONTRACT_ABI = CONTRACT_ABI_JSON as any;
