import React from 'react';
import { useConfig } from '../hooks';
import TransferDialog from './components/Transfer';
import XcmTransferDialog from './components/XcmTransfer';

const PolkadotSufficientAsset = () => {
  const { useXcmTransfer } = useConfig();
  return <>{useXcmTransfer ? <XcmTransferDialog /> : <TransferDialog />}</>;
};

export default PolkadotSufficientAsset;
