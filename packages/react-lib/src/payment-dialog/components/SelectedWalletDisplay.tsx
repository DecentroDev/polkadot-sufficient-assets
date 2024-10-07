import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import type { InjectedPolkadotAccount } from '@polkadot-sufficient-assets/core';
import React, { type ElementRef, forwardRef, useMemo } from 'react';
import { useWallet } from '../../hooks';
import { shortenAddress } from '../../lib/utils';
import WalletIcon from './WalletIcon';

interface Props {
  account?: Partial<InjectedPolkadotAccount> | null;
}

const SelectedWalletDisplay = forwardRef<ElementRef<typeof Button>, Props>(({ account, ...props }, ref) => {
  const { connected } = useWallet();

  const label = useMemo(() => {
    if (!connected) return 'Connect Wallet';

    if (account && account?.address) {
      if (account.wallet) {
        return (
          <Box display='flex' alignItems='center' justifyContent='start' gap={1}>
            {shortenAddress(account.address)}
            <WalletIcon size={24} walletId={account.wallet} />
          </Box>
        );
      }
      return account.address;
    }

    return 'Select Account';
  }, [account, connected]);

  return (
    <Button
      sx={{
        justifyContent: 'space-between',
        textTransform: 'capitalize',
        fontWeight: 400,
        fontSize: 16,
        minHeight: 50,
      }}
      endIcon={<KeyboardArrowDownIcon />}
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
