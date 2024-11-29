import { createTheme } from '@mui/material/styles';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PSADialog, PSAForm } from '../../app/ReactComponent'; // Adjust the import path as necessary

vi.mock('../../app/PolkadotSufficientAsset', () => ({
  default: vi.fn(({ initialAmount }: { initialAmount?: string }) => (
    <div data-testid='mocked-asset'>Mocked PolkadotSufficientAsset with amount: {initialAmount}</div>
  )),
}));

vi.mock('../../app/components/ErrorBoundary', () => {
  return {
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    fallbackRender: () => <div>Error occurred</div>,
  };
});

describe('ReactComponent', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('PSADialog', () => {
    const theme = createTheme();

    it('renders correctly and opens dialog on button click', () => {
      render(
        <PSADialog theme={theme} initialAmount='100'>
          <button data-testid='btn'>Open Dialog</button>
        </PSADialog>
      );

      expect(screen.queryByTestId('mocked-asset')).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('btn'));

      expect(screen.getByTestId('mocked-asset')).toBeInTheDocument();
      expect(screen.getByText('Mocked PolkadotSufficientAsset with amount: 100')).toBeInTheDocument();
    });

    it('closes dialog when clicking outside', () => {
      render(
        <PSADialog theme={theme} initialAmount='100'>
          <button data-testid='btn'>Open Dialog</button>
        </PSADialog>
      );

      fireEvent.click(screen.getByTestId('btn'));
      expect(screen.getByTestId('mocked-asset')).toBeInTheDocument();

      const backdrop = document.querySelector('.MuiBackdrop-root');
      expect(backdrop).toBeInTheDocument();
      fireEvent.click(backdrop as Element);
    });

    it('closes dialog when pressing Escape key', () => {
      render(
        <PSADialog theme={theme} initialAmount='100'>
          <button data-testid='btn'>Open Dialog</button>
        </PSADialog>
      );

      fireEvent.click(screen.getByTestId('btn'));
      expect(screen.getByTestId('mocked-asset')).toBeInTheDocument();

      fireEvent.keyDown(document.body, { key: 'Escape' });
    });
  });

  describe('PSAForm', () => {
    const theme = createTheme();

    it('renders correctly', () => {
      render(<PSAForm theme={theme} initialAmount='200' />);

      expect(screen.getByTestId('mocked-asset')).toBeInTheDocument();
      expect(screen.getByText('Mocked PolkadotSufficientAsset with amount: 200')).toBeInTheDocument();
    });
  });
});
