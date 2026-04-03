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

export const ENTRY_FEE = parseTokenUnits('0.01', DEFAULT_STABLE_TOKEN_DECIMALS);

export interface ArcadeSdkConfig {
  contractAddress: Address;
  stableTokenAddress: Address;
  stableTokenSymbol: string;
  stableTokenDecimals: number;
  miniPayFeeCurrency: Address;
  entryFee: bigint;
}

export function createArcadeConfig(overrides: Partial<ArcadeSdkConfig> = {}): ArcadeSdkConfig {
  const stableTokenDecimals = overrides.stableTokenDecimals ?? DEFAULT_STABLE_TOKEN_DECIMALS;

  return {
    contractAddress: overrides.contractAddress ?? DEFAULT_CONTRACT_ADDRESS,
    stableTokenAddress: overrides.stableTokenAddress ?? DEFAULT_STABLE_TOKEN_ADDRESS,
    stableTokenSymbol: overrides.stableTokenSymbol ?? DEFAULT_STABLE_TOKEN_SYMBOL,
    stableTokenDecimals,
    miniPayFeeCurrency: overrides.miniPayFeeCurrency ?? DEFAULT_MINIPAY_FEE_CURRENCY,
    entryFee: overrides.entryFee ?? parseTokenUnits('0.01', stableTokenDecimals),
  };
}

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'usdmTokenAddress', type: 'address' },
      { internalType: 'uint256', name: 'initialEntryFee', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'deposited', type: 'uint256' },
      { indexed: false, name: 'toPrizePool', type: 'uint256' },
      { indexed: false, name: 'season', type: 'uint256' },
    ],
    name: 'AccessGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'CreatorWithdraw',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'oldFee', type: 'uint256' },
      { indexed: false, name: 'newFee', type: 'uint256' },
      { indexed: true, name: 'updatedBy', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'EntryFeeUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'rank', type: 'uint256' },
      { indexed: false, name: 'totalScore', type: 'uint256' },
    ],
    name: 'LeaderboardUpdated',
    type: 'event',
  },
  { inputs: [], name: 'CLAIM_COOLDOWN', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'ENTRY_FEE', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'MAX_DIFFICULTY', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'MAX_ENTRY_FEE', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'MAX_GAME_TYPE', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'MIN_ENTRY_FEE', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'canClaimPrize', outputs: [{ name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'player', type: 'address' }], name: 'checkAccess', outputs: [{ name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'creatorEarnings', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'entryFee', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getArcadeStats', outputs: [{ name: '_prizePool', type: 'uint256' }, { name: '_totalPlayers', type: 'uint256' }, { name: '_totalGamesPlayed', type: 'uint256' }, { name: '_season', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getCurrentSeason', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getLeaderboard', outputs: [{ components: [{ name: 'player', type: 'address' }, { name: 'totalScore', type: 'uint256' }], name: '', type: 'tuple[10]' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'difficulty', type: 'uint8' }], name: 'getMultiplier', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'pure', type: 'function' },
  { inputs: [{ name: 'player', type: 'address' }], name: 'getPlayerStats', outputs: [{ name: 'hasAccess', type: 'bool' }, { name: 'totalScore', type: 'uint256' }, { name: 'gamesPlayed', type: 'uint256' }, { name: 'lastPlayTime', type: 'uint256' }, { name: 'seasonJoined', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getPrizePool', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getTimeUntilNextClaim', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getTopPlayer', outputs: [{ name: '', type: 'address' }, { name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'lastClaimTime', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'owner', outputs: [{ name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'prizePool', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'seasonNumber', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'seasonStartTime', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalGamesPlayed', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalPlayers', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'usdmToken', outputs: [{ name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
] as const;
