import { Alert, AlertTitle } from '@mui/material';
import {
  type ComponentType,
  type ErrorInfo,
  type PropsWithChildren,
  type ReactNode,
  Component,
  createElement,
} from 'react';

type FallbackProps = {
  error: any;
  resetErrorBoundary: (...args: any[]) => void;
};

type ErrorBoundarySharedProps = PropsWithChildren<{
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: (
    details:
      | { reason: 'imperative-api'; args: any[] }
      | { reason: 'keys'; prev: any[] | undefined; next: any[] | undefined }
  ) => void;
  resetKeys?: any[];
}>;

type ErrorBoundaryPropsWithComponent = ErrorBoundarySharedProps & {
  fallback?: never;
  FallbackComponent: ComponentType<FallbackProps>;
  fallbackRender?: never;
};

type ErrorBoundaryPropsWithRender = ErrorBoundarySharedProps & {
  fallback?: never;
  FallbackComponent?: never;
  fallbackRender: (props: FallbackProps) => ReactNode;
};

type ErrorBoundaryPropsWithFallback = ErrorBoundarySharedProps & {
  fallback: ReactNode;
  FallbackComponent?: never;
  fallbackRender?: never;
};

type ErrorBoundaryProps =
  | ErrorBoundaryPropsWithFallback
  | ErrorBoundaryPropsWithComponent
  | ErrorBoundaryPropsWithRender;
type ErrorBoundaryState = { didCatch: true; error: any } | { didCatch: false; error: null };

const initialState: ErrorBoundaryState = {
  didCatch: false,
  error: null,
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
    this.state = initialState;
  }

  static getDerivedStateFromError(error: Error) {
    return { didCatch: true, error };
  }

  resetErrorBoundary(...args: any[]) {
    const { error } = this.state;

    if (error !== null) {
      this.props.onReset?.({
        args,
        reason: 'imperative-api',
      });

      this.setState(initialState);
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    const { didCatch } = this.state;
    const { resetKeys } = this.props;

    // There's an edge case where if the thing that triggered the error happens to *also* be in the resetKeys array,
    // we'd end up resetting the error boundary immediately.
    // This would likely trigger a second error to be thrown.
    // So we make sure that we don't check the resetKeys on the first call of cDU after the error is set.

    if (didCatch && prevState.error !== null && hasArrayChanged(prevProps.resetKeys, resetKeys)) {
      this.props.onReset?.({
        next: resetKeys,
        prev: prevProps.resetKeys,
        reason: 'keys',
      });

      this.setState(initialState);
    }
  }

  render() {
    const { children, fallbackRender, FallbackComponent, fallback } = this.props;
    const { didCatch, error } = this.state;

    let childToRender = children;

    if (didCatch) {
      const props: FallbackProps = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      };

      if (typeof fallbackRender === 'function') {
        childToRender = fallbackRender(props);
      } else if (FallbackComponent) {
        childToRender = createElement(FallbackComponent, props);
      } else if (fallback !== undefined) {
        childToRender = fallback;
      }
    }

    return <>{childToRender}</>;
  }
}

function hasArrayChanged(a: any[] = [], b: any[] = []) {
  return a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]));
}

export function fallbackRender({ error }: { error: Error }) {
  return (
    <Alert severity='error' variant='outlined'>
      <AlertTitle>Application error</AlertTitle>
      [Error] {error.message}
      <br />
      <br />
      Please check your application config or contact us if the issue persists.
    </Alert>
  );
}
