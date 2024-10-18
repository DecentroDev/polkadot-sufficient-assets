import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useExtensionInfo, useWallet } from '../../hooks';
import Spinner from './Spinner';
import WalletIcon from './WalletIcon';

interface Props {
  name: string;
}

const ExtensionButton = ({ name }: Props) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const { connect, disconnect, connectedWallets } = useWallet();
  const { extension } = useExtensionInfo(name);
  const isConnected = connectedWallets.includes(name);

  const handleClick = async () => {
    try {
      setLoading(true);
      if (isConnected) {
        await disconnect(name);
      } else {
        await connect(name);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  return (
    <Button onClick={handleClick} sx={{ minHeight: 50 }} variant={'outlined'} disabled={loading} fullWidth>
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, alignItems: 'center' }}>
        <WalletIcon walletId={name} />

        <Typography variant='h3' sx={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize' }}>
          {extension?.title}
        </Typography>
      </Box>

      {loading ? (
        <Spinner />
      ) : (
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: isConnected ? theme.palette.success.main : theme.palette.error.main,
          }}
        ></Box>
      )}
    </Button>
  );
};

export default ExtensionButton;
