import EditIcon from '@mui/icons-material/BorderColor';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import type { InjectedPolkadotAccount, Token } from '@polkadot-sufficient-assets/core';
import { useEffect, useMemo, useState } from 'react';
import { useTokenBalance, useTransaction, useTransfer, useWallet } from '../../hooks';
import { formatNumberInput, prettyBalance } from '../../lib/utils';
import LoadingButton from './LoadingButton';
import SelectFeeTokenDialog from './SelectFeeTokenDialog';
import SelectWalletDialog from './SelectWalletDialog';
import SelectedWalletDisplay from './SelectedWalletDisplay';
interface ISelectPaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

const SelectPaymentDialog = ({ open, onClose }: ISelectPaymentDialogProps) => {
  const theme = useTheme();
  const { api, token, feeTokens, chain, isLoaded } = useTransfer();
  const [to, setTo] = useState<Partial<InjectedPolkadotAccount>>();
  const [amount, setAmount] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);
  const { signer, setSigner } = useWallet();
  const [feeToken, setTokenFee] = useState<Token | null>(null);
  const { tx, fee } = useTransaction(api, token, feeToken!, amount, signer?.address, to?.address);

  const { valueFormatted: balanceFormatted, value: balance } = useTokenBalance(token, signer?.address);
  const { valueFormatted: feeBalanceFormatted, value: feeBalance } = useTokenBalance(feeToken!, signer?.address);

  const handleTransfer = async () => {
    if (!to || !amount || !signer || !isLoaded || !token) return;
    setLoading(true);

    if (!tx) {
      setLoading(false);
      return;
    }
    tx.signAndSubmit(signer.polkadotSigner)
      .then((result) => {
        console.log('Transaction successful:', result);
        setAmount('0');
        setLoading(false);
      })
      .catch((error) => {
        console.error('Transaction failed:', error);
        setLoading(false);
      });
  };

  const handleChange = (acc: Partial<InjectedPolkadotAccount>, type: 'from' | 'to' = 'from') => {
    if (type === 'from') {
      setSigner(acc as InjectedPolkadotAccount);
    } else {
      setTo(acc);
    }
  };

  useEffect(() => {
    if (!feeTokens?.[0]) return;
    setTokenFee(feeTokens[0]);
  }, []);

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
      Number.parseFloat(amount) > prettyBalance(balance ?? BigInt(0)) ||
      prettyBalance(fee.value) > prettyBalance(feeBalance ?? BigInt(0))
    );
  }, [to, signer, amount, isLoaded, token, loading, balance, fee.value, feeBalance]);
  return (
    <>
      <Dialog
        PaperProps={{
          sx: {
            width: '656px',
          },
        }}
        open={open}
        onClose={onClose}
      >
        <DialogContent>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <CloseIcon sx={{ cursor: 'pointer' }} onClick={onClose} />
            </Box>

            <Stack spacing={2}>
              <Typography>From</Typography>
              <SelectWalletDialog token={token} selected={signer} onChange={(v) => handleChange(v, 'from')}>
                <SelectedWalletDisplay account={signer} />
              </SelectWalletDialog>
            </Stack>
            <Stack spacing={2} mt={2}>
              <Typography>To</Typography>
              <SelectWalletDialog token={token} withInput={true} onChange={(v) => handleChange(v, 'to')}>
                <SelectedWalletDisplay account={to} />
              </SelectWalletDialog>
            </Stack>

            <Stack spacing={1} mt={2}>
              <Stack direction='row' justifyContent='space-between'>
                <Typography>Tokens</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <img style={{ width: 24, height: 24 }} src={chain?.logo} alt='' />
                  <Typography variant='subtitle2'>{chain?.name}</Typography>
                </Box>
              </Stack>

              <TextField
                disabled={loading}
                value={amount}
                onChange={({ target }) => setAmount(formatNumberInput(target.value, token?.decimals))}
                type='number'
                placeholder='0'
                slotProps={{
                  input: { endAdornment: <InputAdornment position='end'>{token?.symbol}</InputAdornment> },
                }}
                sx={{ minHeight: 50 }}
                fullWidth
              />
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography>Balance</Typography>
              <Typography>{`${balanceFormatted ? balanceFormatted : 0} ${token?.symbol ?? 'USD'}`}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography>Balance fee</Typography>
              <Typography>{`${feeBalanceFormatted ? feeBalanceFormatted : 0} ${feeToken?.symbol}`}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography>Transaction fee</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {feeTokens?.length > 1 && (
                  <SelectFeeTokenDialog currentToken={feeToken!} feeTokens={feeTokens} selectToken={setTokenFee}>
                    <IconButton size='small'>
                      <EditIcon fontSize='small' />
                    </IconButton>
                  </SelectFeeTokenDialog>
                )}
                <Typography>{`${fee?.valueFormatted ?? 0} ${feeToken?.symbol}`}</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectPaymentDialog;
