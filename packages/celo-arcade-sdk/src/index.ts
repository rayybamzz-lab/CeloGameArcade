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

function assertDecimals(decimals: number) {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new Error(`Invalid token decimals: ${decimals}`);
  }
}

export function parseTokenUnits(value: string | number | bigint, decimals: number): bigint {
  assertDecimals(decimals);

  if (typeof value === 'bigint') return value;

  const normalized = String(value).trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Invalid token amount: ${normalized}`);
  }

  const [whole, fraction = ''] = normalized.split('.');
  if (fraction.length > decimals) {
    throw new Error(`Too many decimal places for ${decimals}-decimals token amount: ${normalized}`);
  }

  return BigInt(`${whole}${fraction.padEnd(decimals, '0')}`);
}

export function formatTokenUnits(value: bigint, decimals: number): string {
  assertDecimals(decimals);

  const zero = BigInt(0);
  const negative = value < zero;
  const absolute = negative ? -value : value;
  const divisor = BigInt(`1${'0'.repeat(decimals)}`);
  const whole = absolute / divisor;
  const fraction = (absolute % divisor).toString().padStart(decimals, '0').replace(/0+$/, '');
  const formatted = fraction ? `${whole.toString()}.${fraction}` : whole.toString();

  return negative ? `-${formatted}` : formatted;
}
