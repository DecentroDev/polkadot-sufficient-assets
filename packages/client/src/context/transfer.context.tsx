import { tokens, type Api, type Chain, type ChainId, type Token } from '@polkadot-sufficient-assets/core';
import { createContext, memo, useEffect, useState } from 'react';
import { useApi, useConfig, useToken } from '../hooks';
import { WalletProvider } from './wallet.context';

export interface ITransferContext {
  feeTokens: Token[];
  feeToken: Token;
  token: Token;
  nativeToken: Token;
  chain: Chain;
  changeFeeToken: (token: Token) => void;
  useXcmTransfer: boolean;
  xcmChains: Chain[];
  api: Api<ChainId>;
  isLoaded?: boolean;
  destinationAddress?: string;
  lightClientEnable?: boolean;
}

export const TransferContext = createContext<ITransferContext | null>(null);

export interface TransferProvider {
  children: React.ReactNode;
}

const TransferProviderBase = ({ children }: TransferProvider) => {
  const { chains, useXcmTransfer, xcmChains, destinationAddress, lightClients } = useConfig();

  const [chain] = useState(chains[0]);
  const chainId = chain.id;

  const { feeTokens, token } = useToken(chainId);
  const [feeToken, changeFeeToken] = useState<Token>();
  const [api, loaded] = useApi(chainId);

  useEffect(() => {
    if (feeToken || !feeTokens) return;

    changeFeeToken(feeTokens?.[0]);
  }, [feeToken, feeTokens]);

  return (
    <TransferContext.Provider
      value={{
        api,
        isLoaded: loaded,
        changeFeeToken,
        feeToken: feeToken ?? tokens.DOT,
        feeTokens: feeTokens ?? [],
        nativeToken: feeTokens?.find((t) => t.type === 'native') ?? tokens.DOT,
        token: token ?? tokens.DOT,
        chain: chains[0],
        useXcmTransfer: !!useXcmTransfer,
        xcmChains: xcmChains ?? [],
        destinationAddress,
        lightClientEnable: lightClients?.enable,
      }}
    >
      <WalletProvider>{children}</WalletProvider>
    </TransferContext.Provider>
  );
};

export const TransferProvider = memo(TransferProviderBase);
