import { colors, ConfigProvider, createTheme, PaymentDialog } from '@polkadot-sufficient-assets/react';
import './App.css';
import { libConfig } from './lib/lib-config';

function App() {
  const theme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  return (
    <ConfigProvider config={libConfig}>
      <PaymentDialog theme={theme}>
        <button
          style={{
            outline: 'none',
            backgroundColor: colors.orange[500],
            color: '#fff',
          }}
        >
          Open Dialog
        </button>
      </PaymentDialog>
    </ConfigProvider>
  );
}

export default App;
