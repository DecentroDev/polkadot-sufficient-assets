import { type Theme, ThemeProvider } from '@mui/material';
import React, { type ReactElement, type ReactNode, useState } from 'react';
import SelectPaymentDialog from './components/SelectPaymentDialog';
interface IPaymentDialogProps {
  theme: Theme;
  children: ReactNode;
}

const PaymentDialog = ({ children, theme }: IPaymentDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      {React.cloneElement(
        children as ReactElement,
        { onClick: () => setOpen(true) } // Modify onClick to open the dialog
      )}
      <SelectPaymentDialog open={open} onClose={() => setOpen(false)} />
    </ThemeProvider>
  );
};

export default PaymentDialog;
