import MuiDialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { type Theme, ThemeProvider } from '@mui/material/styles';
import React, { type ReactElement, type ReactNode, useState } from 'react';
import PolkadotSufficientAsset from './PolkadotSufficientAsset';
interface Props {
  theme: Theme;
  children: ReactNode;
}

export const PSADialog = ({ children, theme }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      {React.cloneElement(children as ReactElement, { onClick: () => setOpen(true) })}
      <MuiDialog PaperProps={{ sx: { width: '450px' } }} open={open} onClose={() => setOpen(false)}>
        <DialogContent sx={{ position: 'relative' }}>
          <PolkadotSufficientAsset />
        </DialogContent>
      </MuiDialog>
    </ThemeProvider>
  );
};

export const PSAForm = ({ theme }: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <PolkadotSufficientAsset />
    </ThemeProvider>
  );
};
