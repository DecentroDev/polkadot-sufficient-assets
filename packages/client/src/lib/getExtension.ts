import { Extensions, getExtensionIcon } from '@polkadot-ui/assets/extensions';
import type { ExtensionConfig } from '@polkadot-ui/assets/types';

export const getExtension = (walletId: string) => {
  return {
    extension: Extensions[walletId] as ExtensionConfig | undefined,
    Icon: getExtensionIcon(walletId),
  };
};
