import { type Theme, ThemeProvider } from '@mui/material';
import React, { type ReactElement, type ReactNode, useState } from 'react';
import { useConfig } from '../hooks';
import TransferDialog from './TransferDialog';
import XcmTransferDialog from './XcmTransferDialog';
interface IPaymentDialogProps {
  theme: Theme;
  children: ReactNode;
}

const PaymentDialog = ({ children, theme }: IPaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { useXcmTransfer } = useConfig();

  return (
    <ThemeProvider theme={theme}>
      {React.cloneElement(
        children as ReactElement,
        { onClick: () => setOpen(true) } // Modify onClick to open the dialog
      )}
      {useXcmTransfer ? (
        <XcmTransferDialog open={open} onClose={() => setOpen(false)} />
      ) : (
        <TransferDialog open={open} onClose={() => setOpen(false)} />
      )}
    </ThemeProvider>
  );
};

export default PaymentDialog;
