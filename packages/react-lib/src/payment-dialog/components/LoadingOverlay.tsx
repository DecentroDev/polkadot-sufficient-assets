import { Box } from '@mui/material';
import React from 'react';
import Spinner from './Spinner';

const LoadingOverlay = ({ loading }: { loading?: boolean }) => {
  if (!loading) return null;
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000020',
        backdropFilter: 'blur(12px)',
        zIndex: 9999999,
      }}
    >
      <Spinner />
    </Box>
  );
};

export default LoadingOverlay;
