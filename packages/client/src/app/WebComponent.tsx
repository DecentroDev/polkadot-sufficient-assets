import MuiDialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { type Theme, ThemeProvider } from '@mui/material/styles';
import type { ResolvedRegister } from '@polkadot-sufficient-assets/core';
import { ConfigProvider } from '../context/config.context';
import PolkadotSufficientAsset from './PolkadotSufficientAsset';
interface Props {
  theme?: Theme;
  config: ResolvedRegister['config'];
  open?: boolean;
  handleClose?: () => void;
}

export const WebPSADialog = ({ config, theme, handleClose, open }: Props) => {
  return (
    <ConfigProvider config={config}>
      <ThemeProvider theme={theme ?? {}}>
        <MuiDialog PaperProps={{ sx: { width: '450px' } }} open={!!open} onClose={handleClose}>
          <DialogContent sx={{ position: 'relative' }}>
            <PolkadotSufficientAsset />
          </DialogContent>
        </MuiDialog>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export const WebPSAForm = ({ config, theme }: Pick<Props, 'config' | 'theme'>) => {
  return (
    <ConfigProvider config={config}>
      <ThemeProvider theme={theme ?? {}}>
        <PolkadotSufficientAsset />
      </ThemeProvider>
    </ConfigProvider>
  );
};
