import MuiDialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { type Theme, ThemeProvider } from '@mui/material/styles';
import React, { type ReactElement, type ReactNode, useState } from 'react';
import PolkadotSufficientAsset from './PolkadotSufficientAsset';
import { ErrorBoundary, fallbackRender } from './components/ErrorBoundary';
interface Props {
  theme: Theme;
  initialAmount?: string;
  children?: ReactNode;
}

export const PSADialog = ({ children, theme, initialAmount }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <ErrorBoundary fallbackRender={fallbackRender}>
      <ThemeProvider theme={theme}>
        {React.cloneElement(children as ReactElement, { onClick: () => setOpen(true) })}
        <MuiDialog PaperProps={{ sx: { width: '450px' } }} open={open} onClose={() => setOpen(false)}>
          <DialogContent sx={{ position: 'relative' }}>
            <PolkadotSufficientAsset initialAmount={initialAmount} />
          </DialogContent>
        </MuiDialog>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export const PSAForm = ({ theme, initialAmount }: Props) => {
  return (
    <ErrorBoundary fallbackRender={fallbackRender}>
      <ThemeProvider theme={theme}>
        <PolkadotSufficientAsset initialAmount={initialAmount} />
      </ThemeProvider>
    </ErrorBoundary>
  );
};
