import { tokens, type Api, type Chain, type Token } from '@polkadot-sufficient-assets/core';
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

  api: Api<'paseoah'>;
  isLoaded?: boolean;
}

export const TransferContext = createContext<ITransferContext | null>(null);

export interface TransferProvider {
  children: React.ReactNode;
}

const TransferProviderBase = ({ children }: TransferProvider) => {
  const { chains } = useConfig();

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
        api: api as Api<'paseoah'>,
        isLoaded: loaded,
        changeFeeToken,
        feeToken: feeToken ?? tokens.DOT,
        feeTokens: feeTokens ?? [],
        nativeToken: feeTokens?.find((t) => t.type === 'native') ?? tokens.DOT,
        token: token ?? tokens.DOT,
        chain: chains[0],
      }}
    >
      <WalletProvider>{children}</WalletProvider>
    </TransferContext.Provider>
  );
};

export const TransferProvider = memo(TransferProviderBase);
