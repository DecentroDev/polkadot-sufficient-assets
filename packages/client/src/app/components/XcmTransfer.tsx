import EditIcon from '@mui/icons-material/BorderColor';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grow from '@mui/material/Grow';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  type Api,
  type Chain,
  formatUnits,
  getFeeAssetLocation,
  type InjectedPolkadotAccount,
  parseUnits,
} from '@polkadot-sufficient-assets/core';
import React, { useMemo, useState } from 'react';
import { useExistentialDeposit, useTokenBalance, useTransfer, useWallet, useXcmTransaction } from '../../hooks';
import { formatNumberInput } from '../../lib/utils';
import Balance from './core/Balance';
import CrossChainBalance from './core/CrossChainBalance';
import LoadingButton from './core/LoadingButton';
import SelectFeeTokenDialog from './core/SelectFeeTokenDialog';
import SelectWalletDialog from './core/SelectWalletDialog';
import SelectedWalletDisplay from './core/SelectedWalletDisplay';
import Spinner from './core/Spinner';

const XcmTransferDialog = () => {
  const { xcmChains, api, token, feeToken, changeFeeToken, feeTokens, nativeToken, chain, isLoaded } = useTransfer();
  const [to, setTo] = useState<Partial<InjectedPolkadotAccount> | null>(null);
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

  const { value: balance, isLoading: loadingBalance } = useTokenBalance(token, signer?.address);
  const {
    valueFormatted: feeBalanceFormatted,
    value: feeBalance,
    isLoading: loadingFeeBalance,
    error: errorFeeBalance,
  } = useTokenBalance(feeToken, signer?.address);
  const [txResult, setTxResult] = useState<{ hash: string; ok: boolean }>();
  const { value: edToken, isLoading: loadingEdToken } = useExistentialDeposit(chain, token);
  const handleTransfer = async () => {
    if (!to || !amount || !signer || !isLoaded || !token) return;
    setLoading(true);

    if (!tx) {
      setLoading(false);
      return;
    }
    const { nonce } = await (api as Api<'pah'>).query.System.Account.getValue(signer.address, {
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

  const maxAmount = useMemo(() => {
    if (loadingBalance || fee.isLoading || loadingEdToken) return 0;

    // Subtract fee after estimation
    const feeMargin = feeToken.assetId === token.assetId ? fee.value : 0n;

    // To keep account alive we need to substract essential deposit
    const edMargin = feeToken.assetId === token.assetId ? edToken : 0n;

    return balance - feeMargin - edMargin;
  }, [balance, chain, fee.value, edToken]);

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

  const warningMessage = useMemo(() => {
    if (!to || !signer) return null;
    if (to.address !== signer.address)
      return 'Transferring assets to CEX through XCM directly will result in loss of funds. Please send them to your address on the relevant network first.';
  }, [signer, to]);

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
  }, [to, signer, amount, isLoaded, token, loading, balance, fee?.value, feeBalance, errorMessage]);

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
      <Box mt={2}>
        <Stack spacing={1.5} mt={2}>
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
          <SelectWalletDialog token={token} onChange={(v) => handleChange(v, 'from')}>
            <SelectedWalletDisplay onClear={() => handleChange(null, 'to')} account={signer} />
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
            <SelectedWalletDisplay onClear={() => handleChange(null, 'to')} account={to} />
          </SelectWalletDialog>
        </Stack>

        <Stack spacing={1} mt={2}>
          <Stack direction='row' justifyContent='space-between'>
            <Typography>Tokens</Typography>
            <Button
              onClick={() => setAmount(formatUnits(maxAmount, token.decimals))}
              variant='outlined'
              size='small'
              disabled={maxAmount < 0}
            >
              Max
            </Button>
          </Stack>

          <Stack spacing={0.5}>
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
          </Stack>
        </Stack>

        <LoadingButton
          onClick={handleTransfer}
          loading={loading || !isLoaded}
          disabled={isDisableTransfer}
          fullWidth
          variant='contained'
          sx={{ my: 2 }}
        >
          Transfer
        </LoadingButton>

        {errorMessage && (
          <Alert sx={{ mb: warningMessage ? 1 : 2 }} severity='error'>
            {errorMessage}
          </Alert>
        )}

        {warningMessage && (
          <Alert sx={{ mb: 2 }} severity='warning'>
            {warningMessage}
          </Alert>
        )}

        <CrossChainBalance token={token} originChain={chain} destChain={destChain} from={signer} to={to} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant='subtitle2'>Balance fee</Typography>
          <Balance
            balance={feeBalanceFormatted}
            symbol={feeToken?.symbol}
            isLoading={loadingFeeBalance}
            isError={!!errorFeeBalance}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant='subtitle2'>Transaction fee</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {feeTokens?.length > 1 && (
              <SelectFeeTokenDialog currentToken={feeToken} feeTokens={feeTokens} selectToken={changeFeeToken}>
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

export default XcmTransferDialog;
