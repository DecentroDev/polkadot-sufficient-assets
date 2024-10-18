/**
 * Check if a given string input is a valid integer.
 *
 * @param val
 */
export const isNumber = (val: string): boolean => {
  if (!val) return false;

  if (val.length < Number.MAX_SAFE_INTEGER.toString().length) {
    const isNum = Number.parseInt(val);

    return !Number.isNaN(isNum);
  }

  try {
    BigInt(val);
  } catch {
    return false;
  }

  return true;
};
