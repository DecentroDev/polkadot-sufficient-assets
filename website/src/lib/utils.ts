import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isValidNumber = (value: string) => {
  const arr = value.split('');
  if (Number.isNaN(value)) return false;
  if (arr[0] === '0' && Number(arr[1]) > 0) return false;
  if (value.startsWith('-')) return false;
  return true;
};

export const limitDecimalLength = (input: string, max: number = 10) => {
  const num = parseFloat(input);
  if (Number.isNaN(num)) {
    return input;
  }
  // eslint-disable-next-line prefer-const
  let [integerPart, decimalPart] = input.split('.');

  if (decimalPart && decimalPart.length > max) {
    decimalPart = decimalPart.substring(0, max);
  }
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
};

export const formatNumberInput = (value: string, decimals: number = 10) => {
  const arr = value.split('');
  if (!isValidNumber(value)) {
    return arr.splice(1, arr?.length).join('');
  }
  if (Number(value) > 1000000000) {
    return arr?.splice(0, arr.length - 1).join('');
  }
  return limitDecimalLength(value, decimals);
};
