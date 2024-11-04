import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type { InjectedPolkadotAccount } from '@polkadot-sufficient-assets/core';
import React, { type ElementRef, forwardRef, type ReactNode, useMemo } from 'react';
import { useWallet } from '../../../hooks';
import { shortenAddress } from '../../../lib/utils';
import WalletIcon from './WalletIcon';

interface Props {
  account?: Partial<InjectedPolkadotAccount> | null;
  endIcon?: ReactNode;
}

const SelectedWalletDisplay = forwardRef<ElementRef<typeof Button>, Props>(({ endIcon, account, ...props }, ref) => {
  const { connected } = useWallet();

  const label = useMemo(() => {
    if (!connected) return 'Connect Wallet';

    if (account && account?.address) {
      if (account.wallet) {
        return (
          <Box display='flex' alignItems='center' justifyContent='start' gap={1}>
            {shortenAddress(account.address, 7)}
            <WalletIcon size={18} walletId={account.wallet} />
          </Box>
        );
      }
      return shortenAddress(account.address, 7);
    }

    return 'Select Account';
  }, [account, connected]);

  return (
    <Button
      sx={{
        justifyContent: 'space-between',
        textTransform: 'capitalize',
        fontWeight: 400,
        fontSize: 14,
        minHeight: 50,
      }}
      endIcon={endIcon ?? <KeyboardArrowDownIcon />}
      ref={ref}
      variant='outlined'
      fullWidth
      {...props}
    >
      {label}
    </Button>
  );
});

export default SelectedWalletDisplay;
