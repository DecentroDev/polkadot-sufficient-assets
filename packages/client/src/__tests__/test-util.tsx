import type { ReactElement } from 'react';
import * as React from 'react';

import { chains, tokens } from '@polkadot-sufficient-assets/core';
import { cleanup, render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach } from 'vitest';
import { ConfigProvider } from '../context';

export interface ProvidersProps {
  children: React.ReactNode;
}

function TestProviders({ children }: ProvidersProps) {
  return (
    <ConfigProvider
      config={{
        chains: [chains.paseoAssetHubChain],
        lightClients: false,
        tokens: {
          paseoah: {
            token: tokens.PAS,
            feeTokens: [tokens.PAS],
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

const customRender = (ui: ReactElement, options: RenderOptions = {}): RenderResult =>
  render(ui, {
    wrapper: ({ children }) => <TestProviders>{children}</TestProviders>,
    ...options,
  });

afterEach(() => {
  cleanup();
});

export { customRender as render, userEvent };
