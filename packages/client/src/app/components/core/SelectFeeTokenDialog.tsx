import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';

import type { Token } from '@polkadot-sufficient-assets/core';
import React, { useState, type ReactElement, type ReactNode } from 'react';

interface ISelectFeeTokenDialogProps {
  children: ReactNode;
  currentToken: Token;
  feeTokens: Token[];
  selectToken: (token: Token) => void;
}

const SelectFeeTokenDialog = ({ children, currentToken, feeTokens, selectToken }: ISelectFeeTokenDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSelectToken = (token: Token) => {
    selectToken(token);
    setOpen(false);
  };

  return (
    <>
      {React.cloneElement(
        children as ReactElement,
        { onClick: () => setOpen(true) } // Modify onClick to open the dialog
      )}
      <Dialog
        PaperProps={{
          sx: {
            width: '400px',
            borderRadius: '4px',
          },
        }}
        sx={{
          zIndex: 9999,
        }}
        open={open}
        onClose={() => setOpen(false)}
      >
        <DialogContent sx={{ padding: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Select Token Fee</Typography>
            <CloseIcon sx={{ cursor: 'pointer' }} onClick={() => setOpen(false)} />
          </Box>
          <Box sx={{ display: 'block', maxHeight: '20rem', overflowY: 'auto' }}>
            {feeTokens?.map((token) => (
              <Button
                variant={currentToken?.name === token?.name ? 'contained' : 'outlined'}
                onClick={() => handleSelectToken(token)}
                fullWidth
                key={token.name}
                sx={{ border: '1px solid #999', borderRadius: '8px', padding: 2, mt: 1 }}
              >
                {token?.symbol}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectFeeTokenDialog;
