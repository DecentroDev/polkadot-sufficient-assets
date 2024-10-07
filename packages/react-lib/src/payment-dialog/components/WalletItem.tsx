import { Box, Button, Typography } from '@mui/material';
import type { InjectedPolkadotAccount, Token } from '@polkadot-sufficient-assets/core';
import { useTokenBalance } from '../../hooks';
import { shortenAddress } from '../../lib/utils';
import Spinner from './Spinner';
import WalletIcon from './WalletIcon';

interface IWalletItemProps {
  token: Token;
  account: InjectedPolkadotAccount;
  onClick: () => void;
}

const WalletItem = ({ token, account, onClick }: IWalletItemProps) => {
  const { valueFormatted, isLoading } = useTokenBalance(token, account.address);

  return (
    <Button onClick={onClick} fullWidth variant='outlined'>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='subtitle2' fontWeight={700}>
            {account.name}
          </Typography>
          <WalletIcon size={18} walletId={account.wallet} />
        </Box>
        <Typography textAlign='start' variant='subtitle2'>
          {shortenAddress(account.address, 8)}
        </Typography>
      </Box>
      <Typography textAlign={'end'} variant='caption' fontWeight={700}>
        {isLoading ? <Spinner /> : `${valueFormatted} ${token?.symbol}`}
      </Typography>
    </Button>
  );
};

export default WalletItem;
