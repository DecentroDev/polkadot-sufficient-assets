import Button, { type ButtonProps } from '@mui/material/Button';
import React, { type ReactNode } from 'react';
import Spinner from './Spinner';

interface ILoadingButtonProps extends ButtonProps {
  loading?: boolean;
  children: ReactNode;
}

const LoadingButton = ({ loading, children, sx, ...props }: ILoadingButtonProps) => {
  return (
    <Button {...props} sx={{ minHeight: 50, textTransform: 'capitalize', ...sx }} fullWidth variant='contained'>
      {children}
      {loading && <Spinner sx={{ ml: 1 }} />}
    </Button>
  );
};

export default LoadingButton;
