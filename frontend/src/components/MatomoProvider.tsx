'use client';

import { ReactNode } from 'react';
import { useMatomo } from '@/hooks/useMatomo';

interface MatomoProviderProps {
  children: ReactNode;
}

export const MatomoProvider = ({ children }: MatomoProviderProps) => {
  useMatomo(); // Initialize Matomo tracking
  return <>{children}</>;
};