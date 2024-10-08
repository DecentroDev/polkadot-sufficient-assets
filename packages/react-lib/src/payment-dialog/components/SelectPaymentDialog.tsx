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
import type { InjectedPolkadotAccount } from '@polkadot-sufficient-assets/core';
import { useMemo, useState } from 'react';
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
  const { api, token, feeToken, changeFeeToken, feeTokens, nativeToken, chain, isLoaded } = useTransfer();
  const [to, setTo] = useState<Partial<InjectedPolkadotAccount>>();
  const [amount, setAmount] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);
  const { signer, setSigner } = useWallet();
  const { tx, fee } = useTransaction(api, token, feeToken, nativeToken, amount, signer?.address, to?.address);

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

  return (
    <>
      <Dialog PaperProps={{ sx: { width: '450px' } }} open={open} onClose={onClose}>
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
                <Typography
                  align='right'
                  variant='subtitle2'
                >{`${balanceFormatted ? balanceFormatted : 0} ${token?.symbol ?? 'USD'}`}</Typography>
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
                <Typography variant='subtitle2'>{`${fee?.valueFormatted ?? 0} ${feeToken?.symbol}`}</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectPaymentDialog;
