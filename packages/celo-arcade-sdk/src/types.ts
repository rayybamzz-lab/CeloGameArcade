export type Address = `0x${string}`;

export interface ArcadeSdkConfig {
  contractAddress: Address;
  stableTokenAddress: Address;
  stableTokenSymbol: string;
  stableTokenDecimals: number;
  miniPayFeeCurrency: Address;
  entryFee: bigint;
}
