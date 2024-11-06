import React from 'react';

import type { ResolvedRegister } from '@polkadot-sufficient-assets/core';
import { createContext } from 'react';
import { TransferProvider } from './transfer.context';
import { WalletProvider } from './wallet.context';

export const ConfigContext = createContext<ResolvedRegister['config'] | null>(null);

export interface ConfigProvider {
  config: ResolvedRegister['config'];
  children: React.ReactNode;
}

export const ConfigProvider = ({ children, config }: ConfigProvider) => (
  <ConfigContext.Provider value={config}>
    <WalletProvider>
      <TransferProvider>{children}</TransferProvider>
    </WalletProvider>
  </ConfigContext.Provider>
);
