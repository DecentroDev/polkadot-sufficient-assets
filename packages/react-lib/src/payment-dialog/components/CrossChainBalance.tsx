import { Box, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import type { Chain, InjectedPolkadotAccount, Token } from '@polkadot-sufficient-assets/core';
import React from 'react';
import { useForeignTokenBalance, useTokenBalance } from '../../hooks';

interface Props {
  from: InjectedPolkadotAccount | null;
  to?: Partial<InjectedPolkadotAccount>;
  originChain: Chain;
  destChain?: Chain;
  token: Token;
}

const CrossChainBalance = ({ destChain, token, from, originChain, to }: Props) => {
  const { valueFormatted: fromBalanceFormatted } = useTokenBalance(token, from?.address);
  const { valueFormatted: toBalanceFormatted } = useForeignTokenBalance(destChain, token, to?.address);
  return (
    <Card sx={{ p: 2 }} variant='outlined'>
      <Typography align='center' variant='body1' fontWeight={500} mb={2}>
        Transferable Balances
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant='subtitle2'>{originChain.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant='subtitle2'>
            {`${fromBalanceFormatted ? fromBalanceFormatted : '-'} ${token?.symbol ?? 'USD'}`}
          </Typography>
        </Box>
      </Box>

      {destChain ? (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant='subtitle2'>{destChain.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant='subtitle2'>
              {`${toBalanceFormatted ? toBalanceFormatted : '-'} ${token?.symbol ?? 'USD'}`}
            </Typography>
          </Box>
        </Box>
      ) : null}
    </Card>
  );
};

export default CrossChainBalance;
