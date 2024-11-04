import Typography from '@mui/material/Typography';
import React from 'react';
import Spinner from './Spinner';

interface IBalanceProps {
  isLoading: boolean;
  isError: boolean;
  balance?: string;
  symbol: string;
}

const Balance = ({ isLoading, isError, balance, symbol }: IBalanceProps) => {
  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <Typography variant='subtitle2'>{`${isError ? '-' : balance} ${symbol ?? 'USD'}`}</Typography>
      )}
    </>
  );
};

export default Balance;
