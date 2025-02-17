import { ConfigProvider, createTheme, PSADialog, PSAForm } from 'polkadot-sufficient-assets';
import './App.css';
import { libConfig } from './lib/lib-config';

function App() {
  const theme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  return (
    <div>
      <ConfigProvider config={libConfig}>
        <PSAForm theme={theme} />

        <PSADialog theme={theme}>
          <button className='btn'>Open Dialog</button>
        </PSADialog>
      </ConfigProvider>
    </div>
  );
}

export default App;
