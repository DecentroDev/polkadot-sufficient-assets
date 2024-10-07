import { ConfigProvider } from '@polkadot-sufficient-assets/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { libConfig } from './lib/lib-config.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider config={libConfig}>
      <App />
    </ConfigProvider>
  </StrictMode>
);
