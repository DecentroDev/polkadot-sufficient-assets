import React from 'react';
import { useConfig } from '../hooks';
import TransferDialog from './components/Transfer';
import XcmTransferDialog from './components/XcmTransfer';

const PolkadotSufficientAsset = ({ initialAmount }: { initialAmount?: string }) => {
  const { useXcmTransfer } = useConfig();
  return (
    <>
      {useXcmTransfer ? (
        <XcmTransferDialog initialAmount={initialAmount} />
      ) : (
        <TransferDialog initialAmount={initialAmount} />
      )}
    </>
  );
};

export default PolkadotSufficientAsset;
