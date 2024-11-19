import EditIcon from '@mui/icons-material/BorderColor';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grow from '@mui/material/Grow';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  type Api,
  type ChainIdPara,
  getFeeAssetLocation,
  type InjectedPolkadotAccount,
  parseUnits,
} from '@polkadot-sufficient-assets/core';
import React, { useMemo, useState } from 'react';
import { useExistentialDeposit, useTokenBalance, useTransaction, useTransfer, useWallet } from '../../hooks';
import { formatNumberInput } from '../../lib/utils';
import Balance from './core/Balance';
import LoadingButton from './core/LoadingButton';
import SelectedWalletDisplay from './core/SelectedWalletDisplay';
import SelectFeeTokenDialog from './core/SelectFeeTokenDialog';
import SelectWalletDialog from './core/SelectWalletDialog';
import Spinner from './core/Spinner';
import type { XcmTransferDialogProps } from './XcmTransfer';

interface TransferDialogProps extends XcmTransferDialogProps {}

const Transfer = ({ initialAmount }: TransferDialogProps) => {
  const {
    api,
    token,
    feeToken,
    changeFeeToken,
    feeTokens,
    nativeToken,
    chain,
    destinationAddress,
    isLoaded,
    lightClientEnable,
  } = useTransfer();
  const [to, setTo] = useState<Partial<InjectedPolkadotAccount> | null>(
    destinationAddress ? { address: destinationAddress } : null
  );
  const [amount, setAmount] = useState<string>(initialAmount ?? '0');
  const [loading, setLoading] = useState<boolean>(false);
  const { signer, setSigner } = useWallet();
  const { tx, fee } = useTransaction(api, token, feeToken, nativeToken, amount, signer?.address, to?.address);

  const {
    valueFormatted: balanceFormatted,
    value: balance,
    isLoading: loadingBalance,
    error: errorBalance,
  } = useTokenBalance(token, signer?.address);
  const {
    valueFormatted: feeBalanceFormatted,
    value: feeBalance,
    isLoading: loadingFeeBalance,
    error: errorFeeBalance,
  } = useTokenBalance(feeToken!, signer?.address);
  const { value: edToken, isLoading: loadingEdToken } = useExistentialDeposit(chain, token);

  const [txResult, setTxResult] = useState<{ hash: string; ok: boolean }>();

  const handleTransfer = async () => {
    if (!to || !amount || !signer || !isLoaded || !token) return;
    setLoading(true);

    if (!tx) {
      setLoading(false);
      return;
    }

    const { nonce } = await (api as Api<ChainIdPara>).query.System.Account.getValue(signer.address, {
      at: 'best',
    });

    tx.signAndSubmit(signer.polkadotSigner, {
      asset: feeToken ? getFeeAssetLocation(feeToken, api.chainId) : undefined,
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

  const handleChange = (acc: Partial<InjectedPolkadotAccount> | null, type: 'from' | 'to' = 'from') => {
    if (type === 'from') {
      setSigner(acc as InjectedPolkadotAccount);
    } else {
      setTo(acc);
    }
  };

  const errorMessage = useMemo(() => {
    if (amount === '0' || loadingEdToken || loadingBalance) return null;
    const plancks = parseUnits(amount, token.decimals);

    // Subtract fee after estimation
    const feeMargin = feeToken.assetId === token.assetId ? fee.value : 0n;

    // To keep account alive we need to substract essential deposit
    const edMargin = feeToken.assetId === token.assetId ? edToken : 0n;

    if (balance < plancks) return 'Insufficient balance';
    if (balance < plancks + feeMargin) return 'Insufficient balance to pay for fee';
    if (balance < plancks + feeMargin + edMargin) return 'Insufficient balance to keep account alive';

    return null;
  }, [amount, balance, feeToken, token, fee, edToken, loadingBalance]);

  const isDisableTransfer = useMemo(() => {
    return (
      !!errorMessage ||
      !to ||
      !amount ||
      !signer ||
      !isLoaded ||
      !token ||
      amount === '0' ||
      !fee?.value ||
      !feeBalance ||
      loading
    );
  }, [to, signer, amount, isLoaded, token, loading, feeToken, balance, fee.value, feeBalance, errorMessage]);

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

      <Box>
        <Stack spacing={2}>
          <Typography>From</Typography>
          <SelectWalletDialog token={token} exclude={to} onChange={(v) => handleChange(v, 'from')}>
            <SelectedWalletDisplay onClear={() => handleChange(null, 'from')} account={signer} />
          </SelectWalletDialog>
        </Stack>
        <Stack spacing={2} mt={2}>
          <Typography>To</Typography>
          {destinationAddress ? (
            <SelectedWalletDisplay account={to} />
          ) : (
            <SelectWalletDialog token={token} exclude={signer} withInput={true} onChange={(v) => handleChange(v, 'to')}>
              <SelectedWalletDisplay onClear={() => handleChange(null, 'to')} account={to} />
            </SelectWalletDialog>
          )}
        </Stack>

        <Stack spacing={1} mt={2}>
          <Stack direction='row' justifyContent='space-between'>
            <Typography>Tokens</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img style={{ width: 24, height: 24 }} src={chain?.logo} alt='' />
              <Typography variant='subtitle2'>{chain?.name}</Typography>
            </Box>
          </Stack>

          <Stack spacing={2}>
            <TextField
              disabled={loading}
              value={amount}
              onChange={({ target }) => setAmount(formatNumberInput(target.value, token?.decimals))}
              type='number'
              placeholder='0'
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position='end'>{token?.symbol}</InputAdornment>,
                },
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
            <Stack direction={'row'} justifyContent={'end'}>
              <Balance
                balance={balanceFormatted}
                symbol={token?.symbol}
                isLoading={loadingBalance}
                isError={!!errorBalance}
              />
            </Stack>
          </Stack>
        </Stack>

        <LoadingButton
          onClick={handleTransfer}
          loading={loading || !isLoaded}
          disabled={isDisableTransfer}
          fullWidth
          variant='contained'
          sx={{ mt: 2 }}
        >
          {!isLoaded && lightClientEnable ? 'Synchronizing light clients' : 'Transfer'}
        </LoadingButton>

        {errorMessage && (
          <Alert sx={{ my: 2 }} severity='error'>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Typography variant='subtitle2'>Balance</Typography>
          <Balance
            balance={feeBalanceFormatted}
            symbol={feeToken?.symbol}
            isLoading={loadingFeeBalance}
            isError={!!errorFeeBalance}
          />
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
              <>
                {fee?.error ? (
                  <Typography variant='subtitle2'>{"Can't estimate fee"}</Typography>
                ) : (
                  <Balance
                    balance={fee?.valueFormatted}
                    symbol={feeToken?.symbol}
                    isLoading={fee?.isLoading}
                    isError={fee?.valueFormatted === '0' && !fee.isLoading}
                  />
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Transfer;
