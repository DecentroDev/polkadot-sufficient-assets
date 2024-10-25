/**
 * Formats a number into a compact string representation with a specified number of significant digits.
 *
 * @param num - The number to format, which can be a string, number, or null. If null or undefined, returns an empty string.
 * @param digits - The number of significant digits to include in the formatted output. Defaults to 4.
 *
 * @returns A string representing the compact format of the number. If the number is zero, returns '0'. If the number is
 * smaller than the minimum displayable value based on the number of significant digits, returns a string in the format
 * `< minDisplayable>`.
 *
 * @throws An error if the input is not a valid number.
 */
export const formatDecimals = (num?: string | number | null, digits = 4): string => {
  try {
    if (num === null || num === undefined) return '';

    const value = Number(num);
    if (isNaN(value)) {
      throw new Error(`Invalid number: ${num}`);
    }
    if (value === 0) return '0';

    const minDisplayable = 1 / 10 ** digits;
    if (value < minDisplayable) return `< ${minDisplayable.toFixed(digits)}`;

    const format = Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumSignificantDigits: digits > 0 ? digits : undefined,
    });

    return format.format(Number(Number(num).toFixed(digits)));
  } catch (err) {
    console.error('formatDecimals', { err, num, digits });
    throw err;
  }
};

/**
 * Format a raw balance from a chain into a string, including decimal notation.
 *
 * @param rawBalance The raw balance from the chain, as a string, number, or bigint. If not provided, returns '0'.
 * @param decimals The number of decimal places to use when formatting. Defaults to 10.
 *
 * @returns The formatted balance as a string.
 *
 * @example
 * formatUnits('1000000000', 12) // '1000.000000'
 * formatUnits('1000000000', 10) // '10000.0000'
 * formatUnits('1000000000', 4) // '1000.0'
 */
export const formatUnits = (rawBalance?: string | number | bigint | null, decimals = 10) => {
  if (!rawBalance) return '0';
  let display = rawBalance.toString();

  const negative = display.startsWith('-');
  if (negative) display = display.slice(1);

  display = display.padStart(decimals, '0');

  let [integer, fraction] = [display.slice(0, display.length - decimals), display.slice(display.length - decimals)];
  fraction = fraction.replace(/(0+)$/, '');
  return `${negative ? '-' : ''}${integer || '0'}${fraction ? `.${fraction}` : ''}`;
};

/**
 * Format a raw balance from a chain into a compact string representation with a specified number of significant digits.
 *
 * @param rawBalance The raw balance from the chain, as a string, number, or bigint. If not provided, returns '0'.
 * @param decimals The number of decimal places to use when formatting. Defaults to 10.
 * @param digits The number of significant digits to include in the formatted output. Defaults to 4.
 *
 * @returns A string representing the compact format of the balance. If the number is zero, returns '0'. If the number is
 * smaller than the minimum displayable value based on the number of significant digits, returns a string in the format
 * `< minDisplayable>`.
 *
 * @throws An error if the input is not a valid number.
 */
export const formatBalance = (rawBalance?: string | number | bigint | null, decimals = 10, digits = 4): string => {
  const num = formatUnits(rawBalance, decimals);
  return formatDecimals(num, digits);
};

/**
 * Parse a string value into a raw balance, as a bigint.
 *
 * @param value The value to parse, as a string. If not provided, returns 0n.
 * @param decimals The number of decimal places to use when parsing. Defaults to 10.
 *
 * @returns The parsed raw balance as a bigint.
 *
 * @throws {Error} If the value is not a valid number.
 *
 * @example
 * parseUnits('1000000000', 12) // 1000000000000n
 * parseUnits('1000000000', 10) // 10000000000n
 * parseUnits('1000000000', 4) // 100000000n
 */
export function parseUnits(value: string, decimals = 10) {
  if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(value)) throw new Error('Invalid value');

  let [integer, fraction = '0'] = value.split('.');

  const negative = integer.startsWith('-');
  if (negative) integer = integer.slice(1);

  // trim trailing zeros.
  fraction = fraction.replace(/(0+)$/, '');

  // round off if the fraction is larger than the number of decimals.
  if (decimals === 0) {
    if (Math.round(Number(`.${fraction}`)) === 1) integer = `${BigInt(integer) + 1n}`;
    fraction = '';
  } else if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals),
    ];

    const rounded = Math.round(Number(`${unit}.${right}`));
    if (rounded > 9) fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, '0');
    else fraction = `${left}${rounded}`;

    if (fraction.length > decimals) {
      fraction = fraction.slice(1);
      integer = `${BigInt(integer) + 1n}`;
    }

    fraction = fraction.slice(0, decimals);
  } else {
    fraction = fraction.padEnd(decimals, '0');
  }

  return BigInt(`${negative ? '-' : ''}${integer}${fraction}`);
}
