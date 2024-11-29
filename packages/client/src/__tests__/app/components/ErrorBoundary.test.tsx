import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary, fallbackRender } from '../../../app/components/ErrorBoundary';

const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal Component</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeDefined();
  });

  it('should render fallback when error occurs', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeDefined();
  });

  it('should call onError when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary fallback={<div>Error occurred</div>} onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it('should render FallbackComponent when provided', () => {
    const FallbackComponent = ({ error }: { error: Error }) => <div>Custom Error: {error.message}</div>;

    render(
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error: Test error')).toBeDefined();
  });

  it('should render fallbackRender when provided', () => {
    const customFallbackRender = ({ error }: { error: Error }) => <div>Render Error: {error.message}</div>;

    render(
      <ErrorBoundary fallbackRender={customFallbackRender}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Render Error: Test error')).toBeDefined();
  });

  it('should reset error boundary when resetErrorBoundary is called', () => {
    const onReset = vi.fn();
    let resetErrorBoundaryFn: ((...args: any[]) => void) | undefined;

    const FallbackComponent = ({
      error,
      resetErrorBoundary,
    }: {
      error: Error;
      resetErrorBoundary: (...args: any[]) => void;
    }) => {
      resetErrorBoundaryFn = resetErrorBoundary;
      return <button onClick={() => resetErrorBoundary('test-arg')}>Reset</button>;
    };

    render(
      <ErrorBoundary FallbackComponent={FallbackComponent} onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Reset')).toBeDefined();

    fireEvent.click(screen.getByText('Reset'));

    expect(onReset).toHaveBeenCalledWith({
      reason: 'imperative-api',
      args: ['test-arg'],
    });

    expect(resetErrorBoundaryFn).toBeDefined();
    resetErrorBoundaryFn?.('another-arg');
    expect(onReset).toHaveBeenCalledWith({
      reason: 'imperative-api',
      args: ['another-arg'],
    });
  });

  it('should call onReset and reset state when resetKeys change after error', () => {
    const onReset = vi.fn();

    const { rerender } = render(
      <ErrorBoundary fallback={<div>Error occurred</div>} onReset={onReset} resetKeys={[1]}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeDefined();

    rerender(
      <ErrorBoundary fallback={<div>Error occurred</div>} onReset={onReset} resetKeys={[2]}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(onReset).toHaveBeenCalledWith({
      reason: 'keys',
      prev: [1],
      next: [2],
    });
    expect(screen.getByText('Normal Component')).toBeDefined();
  });
});

describe('fallbackRender', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render error message in fallback component', () => {
    const error = new Error('Error message');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(fallbackRender({ error }));

    expect(screen.getByText('Application error')).toBeDefined();
    expect(screen.getByText(/Please check your application config/)).toBeDefined();

    consoleErrorSpy.mockRestore();
  });
});
