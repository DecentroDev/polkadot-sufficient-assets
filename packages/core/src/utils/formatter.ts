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

export const formatBalance = (rawBalance?: string | number | bigint | null, decimals = 10, digits = 4): string => {
  const num = formatUnits(rawBalance, decimals);
  return formatDecimals(num, digits);
};

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
