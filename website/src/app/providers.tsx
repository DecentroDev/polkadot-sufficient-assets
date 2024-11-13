'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export interface ProvidersProps extends ThemeProviderProps {}

export function Providers({ children, ...props }: ProvidersProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
