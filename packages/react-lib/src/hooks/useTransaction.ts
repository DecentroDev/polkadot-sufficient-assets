import {
  type Api,
  type ChainId,
  formatBalance,
  getFeeAssetLocation,
  getTransferExtrinsic,
  type Token,
} from '@polkadot-sufficient-assets/core';
import React, { useEffect, useMemo, useState } from 'react';
import type { TokenBalance } from '../types';

interface UseTransactionReturn {
  tx: ReturnType<typeof getTransferExtrinsic>;
  fee: TokenBalance;
}

export const useTransaction = (
  api: Api<ChainId>,
  token?: Token,
  feeToken?: Token,
  amount?: string,
  from?: string,
  to?: string
): UseTransactionReturn => {
  const [feeEstimate, setFeeEstimate] = useState<TokenBalance>({
    isLoading: false,
    value: 0n,
    valueFormatted: '0',
  });

  const tx = useMemo(() => {
    if (!api || !to || !amount || !token) return null;

    return getTransferExtrinsic(api, token, amount, to);
  }, [api, amount, to, token]);

  useEffect(() => {
    if (!tx || !from) return;
    const estimate = async () => {
      try {
        setFeeEstimate({ isLoading: true, value: 0n, valueFormatted: '0' });
        const fee = await tx.getEstimatedFees(from, {
          asset: feeToken ? getFeeAssetLocation(feeToken) : undefined,
        });
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
