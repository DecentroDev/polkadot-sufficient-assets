import { useMemo } from 'react';

import { getExtension } from '../lib/getExtension';

export const useExtensionInfo = (name: string) => {
  return useMemo(() => getExtension(name), [name]);
};
