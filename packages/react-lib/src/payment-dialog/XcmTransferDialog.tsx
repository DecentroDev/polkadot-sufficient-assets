import EditIcon from '@mui/icons-material/BorderColor';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grow from '@mui/material/Grow';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { MenuItem } from '@mui/material';
import { type Chain, getFeeAssetLocation, type InjectedPolkadotAccount } from '@polkadot-sufficient-assets/core';
import { useMemo, useState } from 'react';
import { useTokenBalance, useTransfer, useWallet } from '../hooks';
import { useXcmTransaction } from '../hooks/useXcmTransaction';
import { formatNumberInput, prettyBalance } from '../lib/utils';
import LoadingButton from './components/LoadingButton';
import SelectFeeTokenDialog from './components/SelectFeeTokenDialog';
import SelectWalletDialog from './components/SelectWalletDialog';
import SelectedWalletDisplay from './components/SelectedWalletDisplay';
import Spinner from './components/Spinner';
interface Props {
  open: boolean;
  onClose: () => void;
}

const XcmTransferDialog = ({ open, onClose }: Props) => {
  const { xcmChains, api, token, feeToken, changeFeeToken, feeTokens, nativeToken, chain, isLoaded } = useTransfer();
  const [to, setTo] = useState<Partial<InjectedPolkadotAccount>>();
  const [amount, setAmount] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);
  const { signer, setSigner } = useWallet();

  const [destChain, setDestChain] = useState<Chain | undefined>(xcmChains?.[0]);

  const { tx, fee } = useXcmTransaction(
    api,
    token,
    feeToken,
    nativeToken,
    amount,
    signer?.address,
    to?.address,
    destChain
  );

  const { valueFormatted: balanceFormatted, value: balance } = useTokenBalance(token, signer?.address);
  const { valueFormatted: feeBalanceFormatted, value: feeBalance } = useTokenBalance(feeToken!, signer?.address);
  const [txResult, setTxResult] = useState<{
    hash: string;
    ok: boolean;
  }>();

  const handleTransfer = async () => {
    if (!to || !amount || !signer || !isLoaded || !token) return;
    setLoading(true);

    if (!tx) {
      setLoading(false);
      return;
    }
    const { nonce } = await api.query.System.Account.getValue(signer.address, {
      at: 'best',
    });

    tx.signAndSubmit(signer.polkadotSigner, {
      asset: feeToken ? getFeeAssetLocation(feeToken) : undefined,
      nonce: nonce,
      mortality: { mortal: true, period: 64 },
    })
      .then((result) => {
        console.log('Transaction successful:', result);
        setAmount('0');
        setTxResult({ hash: result.txHash, ok: result.ok });
        setLoading(false);
        setTimeout(() => {
          setTxResult(undefined);
        }, 5200);
      })
      .catch((error) => {
        console.error('Transaction failed:', error);
        setTxResult({ hash: '', ok: false });
        setLoading(false);
        setTimeout(() => {
          setTxResult(undefined);
        }, 5200);
      });
  };

  const handleChange = (acc: Partial<InjectedPolkadotAccount>, type: 'from' | 'to' = 'from') => {
    if (type === 'from') {
      setSigner(acc as InjectedPolkadotAccount);
    } else {
      setTo(acc);
    }
  };

  const isDisableTransfer = useMemo(() => {
    return (
      !to ||
      !amount ||
      !signer ||
      !isLoaded ||
      !token ||
      amount === '0' ||
      !fee?.value ||
      !feeBalance ||
      loading ||
      Number.parseFloat(amount) > prettyBalance(balance, token?.decimals) ||
      prettyBalance(fee.value, feeToken?.decimals) > prettyBalance(feeBalance, feeToken?.decimals)
    );
  }, [to, signer, amount, isLoaded, token, loading, feeToken, balance, fee.value, feeBalance]);

  const handleCloseSnackbar = () => {
    setTxResult(undefined);
  };

  return (
    <>
      <Snackbar
        open={!!txResult}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Grow}
      >
        <Alert onClose={handleCloseSnackbar} severity={txResult?.ok ? 'success' : 'error'} variant='filled'>
          <AlertTitle>Transaction executed {txResult?.ok ? 'successful' : 'failed'}!</AlertTitle>
          {txResult?.hash ? (
            <Box display='flex' justifyContent='flex-end'>
              <Button
                onClick={() => window.open(`${chain.blockExplorerUrl}/extrinsic/${txResult?.hash}`)}
                color='inherit'
                size='small'
                variant='outlined'
                sx={{ fontSize: 10 }}
              >
                View on Explorer
              </Button>
            </Box>
          ) : null}
        </Alert>
      </Snackbar>
      <Dialog PaperProps={{ sx: { width: '450px' } }} open={open} onClose={onClose}>
        <DialogContent>
          <Box mt={2}>
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <CloseIcon sx={{ cursor: 'pointer' }} onClick={onClose} />
            </Box>

            <Stack spacing={1.5}>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography>From</Typography>

                <TextField
                  label='From chain'
                  placeholder='Select chain'
                  select
                  size='small'
                  sx={{ minWidth: '140px' }}
                  value={chain.id}
                >
                  <MenuItem value={chain.id}>{chain.name}</MenuItem>
                </TextField>
              </Box>
              <SelectWalletDialog token={token} selected={signer} onChange={(v) => handleChange(v, 'from')}>
                <SelectedWalletDisplay account={signer} />
              </SelectWalletDialog>
            </Stack>
            <Stack spacing={1.5} mt={2}>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography>To</Typography>

                <TextField
                  value={destChain?.id}
                  onChange={(e) => setDestChain(xcmChains.find((x) => x.id === e.target.value))}
                  select
                  size='small'
                  sx={{ minWidth: '140px' }}
                  label='To chain'
                  placeholder='Select chain'
                >
                  {xcmChains.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <SelectWalletDialog token={token} withInput={true} onChange={(v) => handleChange(v, 'to')}>
                <SelectedWalletDisplay account={to} />
              </SelectWalletDialog>
            </Stack>

            <Stack spacing={1} mt={2}>
              <Stack direction='row' justifyContent='space-between'>
                <Typography>Tokens</Typography>
              </Stack>

              <Stack spacing={0.5}>
                <TextField
                  disabled={loading}
                  value={amount}
                  onChange={({ target }) => setAmount(formatNumberInput(target.value, token?.decimals))}
                  type='number'
                  placeholder='0'
                  slotProps={{
                    input: { endAdornment: <InputAdornment position='end'>{token?.symbol}</InputAdornment> },
                  }}
                  sx={{
                    minHeight: 50,
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      display: 'none',
                    },
                    '& input[type=number]': {
                      MozAppearance: 'textfield',
                    },
                  }}
                  fullWidth
                />
                <Typography align='right' variant='subtitle2'>
                  {`${balanceFormatted ? balanceFormatted : 0} ${token?.symbol ?? 'USD'}`}
                </Typography>
              </Stack>
            </Stack>

            <LoadingButton
              onClick={handleTransfer}
              loading={loading}
              disabled={isDisableTransfer}
              fullWidth
              variant='contained'
              sx={{ mt: 4 }}
            >
              Transfer
            </LoadingButton>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Typography variant='subtitle2'>Balance fee</Typography>
              <Typography variant='subtitle2'>{`${feeBalanceFormatted ? feeBalanceFormatted : 0} ${feeToken?.symbol}`}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant='subtitle2'>Transaction fee</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {feeTokens?.length > 1 && (
                  <SelectFeeTokenDialog currentToken={feeToken!} feeTokens={feeTokens} selectToken={changeFeeToken}>
                    <IconButton size='small'>
                      <EditIcon sx={{ width: 16 }} />
                    </IconButton>
                  </SelectFeeTokenDialog>
                )}
                {fee.isLoading ? (
                  <Spinner />
                ) : (
                  <Typography variant='subtitle2'>{`${fee?.valueFormatted ?? 0} ${feeToken?.symbol}`}</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default XcmTransferDialog;
