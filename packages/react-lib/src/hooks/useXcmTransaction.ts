import {
  type Api,
  type Chain,
  type ChainId,
  type ChainIdAssetHub,
  formatBalance,
  getAssetConvertPlancks,
  getFeeAssetLocation,
  getXcmTransferExtrinsic,
  type Token,
} from '@polkadot-sufficient-assets/core';
import React, { useEffect, useMemo, useState } from 'react';
import type { TokenBalance } from '../types';

interface UseXcmTransactionReturn {
  tx: ReturnType<typeof getXcmTransferExtrinsic> | null;
  fee: TokenBalance;
}

export const useXcmTransaction = (
  api: Api<ChainId>,
  token?: Token,
  feeToken?: Token,
  nativeToken?: Token,
  amount?: string,
  from?: string,
  to?: string,
  destChain?: Chain
): UseXcmTransactionReturn => {
  const [feeEstimate, setFeeEstimate] = useState<TokenBalance>({
    isLoading: false,
    value: 0n,
    valueFormatted: '0',
  });

  const tx = useMemo(() => {
    if (!api || !to || !amount || !token || !destChain) return null;

    return getXcmTransferExtrinsic(api, token, amount, to, destChain);
  }, [api, amount, to, token, destChain]);

  useEffect(() => {
    if (!tx || !from || !token) return;
    const estimate = async () => {
      try {
        setFeeEstimate({ isLoading: true, value: 0n, valueFormatted: '0' });
        const { nonce } = await (api as Api<ChainIdAssetHub>).query.System.Account.getValue(from);

        const feeRaw = await tx.getEstimatedFees(from, {
          asset: feeToken ? getFeeAssetLocation(feeToken) : undefined,
          nonce: nonce,
          mortality: { mortal: true, period: 64 },
        });

        const _fee = await getAssetConvertPlancks(api as Api<ChainIdAssetHub>, {
          nativeToken: nativeToken,
          plancks: feeRaw,
          tokenIn: nativeToken,
          tokenOut: feeToken,
        });
        const fee = _fee ?? 0n;

        setFeeEstimate({
          isLoading: false,
          value: fee,
          valueFormatted: formatBalance(fee.toString(), feeToken?.decimals ?? 12),
        });
      } catch (err) {
        setFeeEstimate({ isLoading: false, value: 0n, valueFormatted: '0' });
        console.log(err);
      }
    };

    estimate();
  }, [tx, from, feeToken]);

  return {
    tx,
    fee: feeEstimate,
  };
};
