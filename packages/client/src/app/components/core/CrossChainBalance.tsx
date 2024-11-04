import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type { Chain, InjectedPolkadotAccount, Token } from '@polkadot-sufficient-assets/core';
import React from 'react';
import { useForeignTokenBalance, useTokenBalance } from '../../../hooks';
import Balance from './Balance';

interface Props {
  from: InjectedPolkadotAccount | null;
  to?: Partial<InjectedPolkadotAccount>;
  originChain: Chain;
  destChain?: Chain;
  token: Token;
}

const CrossChainBalance = ({ destChain, token, from, originChain, to }: Props) => {
  const {
    valueFormatted: fromBalanceFormatted,
    isLoading: loadingFrom,
    error: errorFrom,
  } = useTokenBalance(token, from?.address);
  const {
    valueFormatted: toBalanceFormatted,
    isLoading: loadingTo,
    error: errorTo,
  } = useForeignTokenBalance(destChain, token, to?.address);

  return (
    <Card sx={{ p: 2 }} variant='outlined'>
      <Typography align='center' variant='body1' fontWeight={500} mb={2}>
        Transferable Balances
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant='subtitle2'>{originChain.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Balance balance={fromBalanceFormatted} symbol={token.symbol} isError={!!errorFrom} isLoading={loadingFrom} />
        </Box>
      </Box>

      {destChain ? (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant='subtitle2'>{destChain.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Balance balance={toBalanceFormatted} symbol={token.symbol} isError={!!errorTo} isLoading={loadingTo} />
          </Box>
        </Box>
      ) : null}
    </Card>
  );
};

export default CrossChainBalance;
