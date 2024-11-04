import { ConfigProvider, createTheme, PSADialog } from 'polkadot-sufficient-assets';
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
      <PSADialog theme={theme}>
        <button
          style={{
            outline: 'none',
            color: '#fff',
          }}
        >
          Open Dialog
        </button>
      </PSADialog>
    </ConfigProvider>
  );
}

export default App;
