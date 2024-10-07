import RefreshIcon from '@mui/icons-material/Refresh';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useExtensionInfo, useWallet } from '../../hooks';
import WalletIcon from './WalletIcon';

interface Props {
  name: string;
}

const ExtensionButton = ({ name }: Props) => {
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
    <Button onClick={handleClick} sx={{ minHeight: 50 }} variant='outlined' disabled={loading} fullWidth>
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, alignItems: 'center' }}>
        <WalletIcon walletId={name} />

        <Typography variant='h3' sx={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize' }}>
          {extension?.title}
        </Typography>
      </Box>

      {loading ? (
        <RefreshIcon
          sx={{
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
      ) : (
        <>{isConnected ? <WifiIcon /> : <WifiOffIcon />}</>
      )}
    </Button>
  );
};

export default ExtensionButton;
