import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type { InjectedPolkadotAccount } from '@polkadot-sufficient-assets/core';
import React, { type ElementRef, forwardRef, useMemo } from 'react';
import { useWallet } from '../../../hooks';
import { shortenAddress } from '../../../lib/utils';
import WalletIcon from './WalletIcon';

interface Props {
  account?: Partial<InjectedPolkadotAccount> | null;
  onClear?: () => void;
}

const SelectedWalletDisplay = forwardRef<ElementRef<typeof Button>, Props>(({ onClear, account, ...props }, ref) => {
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
      endIcon={account ? onClear ? <ClearIcon onClick={onClear} /> : null : <KeyboardArrowDownIcon />}
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
