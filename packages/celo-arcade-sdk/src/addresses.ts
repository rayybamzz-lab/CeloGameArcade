import type { Address } from './types';

export function isAddress(value: string): value is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function assertAddress(value: string, label = 'address'): asserts value is Address {
  if (!isAddress(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}
