import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { type InjectedPolkadotAccount, isValidAddress, type Token } from '@polkadot-sufficient-assets/core';
import React, { type ReactElement, type ReactNode, useMemo, useState } from 'react';
import { useWallet } from '../../../hooks';
import ExtensionButton from './ExtensionButton';
import WalletItem from './WalletItem';
import WalletItemSkeleton from './WalletItemSkeleton';

interface SelectWalletDialogProps {
  children?: ReactNode;
  withInput?: boolean;
  selected?: InjectedPolkadotAccount | null;
  token: Token;
  onChange: (value: Partial<InjectedPolkadotAccount>) => void;
}

const SelectWalletDialog = ({ children, selected, token, withInput, onChange }: SelectWalletDialogProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [toAddress, setToAddress] = useState('');

  const { accounts, connectedWallets, getInjectedWalletIds } = useWallet();

  const handleSelectAccount = (address: InjectedPolkadotAccount) => {
    onChange?.(address!);
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validAddress = useMemo(() => {
    if (!toAddress) return true;
    return isValidAddress(toAddress);
  }, [toAddress]);

  const handleAddCustomAddress = () => {
    if (!toAddress) return;
    if (!validAddress) return;
    onChange({ address: toAddress });
    handleClose();
  };

  return (
    <>
      {React.cloneElement(
        children as ReactElement,
        { onClick: () => setOpen(true) } // Modify onClick to open the dialog
      )}
      <Dialog PaperProps={{ sx: { width: '400px', borderRadius: 1 } }} open={open} onClose={handleClose}>
        <DialogContent sx={{ padding: 0 }}>
          <Box sx={{ display: 'block', height: '100%' }}>
            <Stack direction='row' justifyContent='space-between' px={1.5} mt={3} mb={1}>
              <Typography variant='h3' sx={{ fontSize: 20, fontWeight: 700 }}>
                Select account
              </Typography>
              <CloseIcon sx={{ cursor: 'pointer' }} onClick={handleClose} />
            </Stack>
            <Box>
              <Stack px={1.5} spacing={1}>
                <Typography variant='body1' fontWeight={600}>
                  Connected wallets
                </Typography>
                <Stack spacing={1}>
                  {getInjectedWalletIds()?.map((name) => (
                    <ExtensionButton name={name} key={name} />
                  ))}
                </Stack>
              </Stack>

              <Box mt={1}>
                <Box px={1.5}>
                  {withInput && (
                    <Box>
                      <Typography variant='h3' sx={{ fontSize: 15, fontWeight: 700, mt: 3 }}>
                        Custom to address
                      </Typography>
                      <Box sx={{ display: 'flex', width: '100%', my: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Input
                            value={toAddress}
                            onChange={({ target }) => setToAddress(target.value)}
                            placeholder='Enter address'
                            fullWidth
                          />
                          {!validAddress && (
                            <Typography variant='h3' fontSize={10} color={theme.palette.error.main} mt={1}>
                              Invalid address
                            </Typography>
                          )}
                        </Box>
                        <Button sx={{ outline: 'none' }} onClick={handleAddCustomAddress}>
                          <SendIcon sx={{ color: theme.palette.primary.main }} />
                        </Button>
                      </Box>
                    </Box>
                  )}

                  <Typography variant='body1' fontWeight={600}>
                    Connected Accounts
                  </Typography>
                </Box>

                <Box px={1.5} py={1.5} sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {connectedWallets?.length === 0 ? (
                    <Typography m={4} variant='h3' textAlign='center' fontSize={14}>
                      No address connected
                    </Typography>
                  ) : (
                    <>
                      {accounts.length === 0 ? (
                        <WalletItemSkeleton />
                      ) : (
                        <Stack spacing={1}>
                          {accounts.map((account) => (
                            <WalletItem
                              key={account.address + '_' + account.wallet}
                              token={token}
                              account={account}
                              onClick={() => handleSelectAccount(account)}
                            />
                          ))}
                        </Stack>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectWalletDialog;
