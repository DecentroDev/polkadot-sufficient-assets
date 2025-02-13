import Button from '@mui/material/Button';
import { tokens, type Token } from '@polkadot-sufficient-assets/core';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SelectFeeTokenDialog from '../../../../app/components/core/SelectFeeTokenDialog';

const mockSelectToken = vi.fn();

const feeTokens: Token[] = [tokens.USDC, tokens.DOT];

const currentToken: Token = tokens.DOT;

describe('SelectFeeTokenDialog', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('opens the dialog when the child element is clicked', async () => {
    const { getByText } = render(
      <SelectFeeTokenDialog currentToken={currentToken} feeTokens={feeTokens} selectToken={mockSelectToken}>
        <Button>Open Dialog</Button>
      </SelectFeeTokenDialog>
    );

    fireEvent.click(getByText('Open Dialog'));

    expect(getByText('Select Token Fee')).toBeInTheDocument();
  });

  it('calls selectToken when a token is selected', async () => {
    const { getByText } = render(
      <SelectFeeTokenDialog currentToken={currentToken} feeTokens={feeTokens} selectToken={mockSelectToken}>
        <Button>Open Dialog</Button>
      </SelectFeeTokenDialog>
    );

    fireEvent.click(getByText('Open Dialog'));

    const tokenButton = getByText('USDC');
    fireEvent.click(tokenButton);

    expect(mockSelectToken).toHaveBeenCalledWith(feeTokens[0]);
  });

  it('closes the dialog when the close icon is clicked', async () => {
    const { getByText, getByTestId, queryByText } = render(
      <SelectFeeTokenDialog currentToken={currentToken} feeTokens={feeTokens} selectToken={mockSelectToken}>
        <Button>Open Dialog</Button>
      </SelectFeeTokenDialog>
    );

    fireEvent.click(getByText('Open Dialog'));
    fireEvent.click(getByTestId('CloseIcon'));

    await waitFor(() => expect(queryByText('Select Token Fee')).not.toBeInTheDocument());
  });

  it('highlights the current token as selected', async () => {
    const { getByText } = render(
      <SelectFeeTokenDialog currentToken={currentToken} feeTokens={feeTokens} selectToken={mockSelectToken}>
        <Button>Open Dialog</Button>
      </SelectFeeTokenDialog>
    );

    fireEvent.click(getByText('Open Dialog'));

    const tokenButton = getByText('DOT');
    expect(tokenButton).toHaveClass('MuiButton-contained');

    const nonSelectedTokenButton = getByText('USDC');
    expect(nonSelectedTokenButton).toHaveClass('MuiButton-outlined');
  });

  it('closes the dialog when clicking outside (backdrop)', async () => {
    const { getByText, queryByText, getByRole } = render(
      <SelectFeeTokenDialog currentToken={currentToken} feeTokens={feeTokens} selectToken={mockSelectToken}>
        <Button>Open Dialog</Button>
      </SelectFeeTokenDialog>
    );

    fireEvent.click(getByText('Open Dialog'));

    const backdrop = document.querySelector('.MuiBackdrop-root');
    fireEvent.click(backdrop!);

    await waitFor(() => expect(queryByText('Select Token Fee')).not.toBeInTheDocument());
  });

  it('renders without feeTokens', async () => {
    const { getByText, queryByText } = render(
      <SelectFeeTokenDialog currentToken={currentToken} feeTokens={[]} selectToken={mockSelectToken}>
        <Button>Open Dialog</Button>
      </SelectFeeTokenDialog>
    );

    fireEvent.click(getByText('Open Dialog'));
    expect(getByText('Select Token Fee')).toBeInTheDocument();
  });

  it('renders with undefined currentToken', async () => {
    const { getByText } = render(
      // @ts-ignore
      <SelectFeeTokenDialog currentToken={undefined} feeTokens={feeTokens} selectToken={mockSelectToken}>
        <Button>Open Dialog</Button>
      </SelectFeeTokenDialog>
    );

    fireEvent.click(getByText('Open Dialog'));

    const tokenButtons = [getByText('USDC'), getByText('DOT')];
    tokenButtons.forEach((button) => {
      expect(button).toHaveClass('MuiButton-outlined');
    });
  });

  it('correctly clones child element with onClick prop', () => {
    const originalOnClick = vi.fn();
    const { getByText } = render(
      <SelectFeeTokenDialog currentToken={currentToken} feeTokens={feeTokens} selectToken={mockSelectToken}>
        <Button onClick={originalOnClick}>Open Dialog</Button>
      </SelectFeeTokenDialog>
    );

    fireEvent.click(getByText('Open Dialog'));
    expect(getByText('Select Token Fee')).toBeInTheDocument();
  });
});
