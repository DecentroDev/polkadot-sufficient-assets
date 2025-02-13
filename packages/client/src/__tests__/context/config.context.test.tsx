import { chains, type Config } from '@polkadot-sufficient-assets/core';
import { cleanup, render } from '@testing-library/react';
import React, { useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigContext, ConfigProvider } from '../../context/config.context'; // Adjust path as needed

// Mock child component to test the provided context
const MockChildComponent = () => {
  const config = useContext(ConfigContext);
  return <div>{config ? 'Config is provided' : 'No config'}</div>;
};

const mockConfig: Config = {
  useXcmTransfer: false,
  sourceChains: [chains.polkadotChain],
};

describe('ConfigProvider', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should provide the correct config value', () => {
    const { getByText } = render(
      <ConfigProvider config={mockConfig}>
        <MockChildComponent />
      </ConfigProvider>
    );

    expect(getByText('Config is provided')).toBeInTheDocument();
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <ConfigProvider config={mockConfig}>
        <div>Test Child</div>
      </ConfigProvider>
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });
});
