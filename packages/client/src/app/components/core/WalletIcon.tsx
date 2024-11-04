import Box from '@mui/material/Box';
import React from 'react';
import { useExtensionInfo } from '../../../hooks';

interface Props {
  walletId: string;
  size?: number;
}
const WalletIcon = ({ size = 24, walletId }: Props) => {
  const { Icon, extension } = useExtensionInfo(walletId);

  if (Icon)
    return (
      <Box width={size} height={size}>
        <Icon style={{ flexShrink: 1 }} />
      </Box>
    );

  return <div>{extension?.title.charAt(0)}</div>;
};

export default WalletIcon;
