import type { ArcadeSdkConfig } from './types';
import {
  DEFAULT_CONTRACT_ADDRESS,
  DEFAULT_MINIPAY_FEE_CURRENCY,
  DEFAULT_STABLE_TOKEN_ADDRESS,
  DEFAULT_STABLE_TOKEN_DECIMALS,
  DEFAULT_STABLE_TOKEN_SYMBOL,
} from './constants';
import { parseTokenUnits } from './units';

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
