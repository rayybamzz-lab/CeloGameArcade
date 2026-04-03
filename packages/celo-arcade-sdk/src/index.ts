export type Address = `0x${string}`;

export const DEFAULT_CONTRACT_ADDRESS = '0xD3Cb0357edF92E1056cfBC3dC5cC1DA52846DDB0' as Address;
export const DEFAULT_STABLE_TOKEN_ADDRESS = '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e' as Address;
export const DEFAULT_STABLE_TOKEN_SYMBOL = 'USDT';
export const DEFAULT_STABLE_TOKEN_DECIMALS = 6;
export const DEFAULT_MINIPAY_FEE_CURRENCY = '0x765DE816845861e75A25fCA122bb6898B8B1282a' as Address;

export const GameType = {
  CAR_RACE: 0,
  SNAKE: 1,
  FLAPPY: 2,
  SPACE_SHOOTER: 3,
  PUZZLE: 4,
} as const;

export const Difficulty = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
} as const;
