'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type QuickAuthReturnTarget =
  | 'messages'
  | 'favoris'
  | 'publish'
  | 'profile'
  | string; // URL arbitraire

interface QuickAuthState {
  open: boolean;
  returnTo: QuickAuthReturnTarget | null;
  onSuccess: (() => void) | null;
}

interface QuickAuthContextValue {
  isOpen: boolean;
  returnTo: QuickAuthReturnTarget | null;
  openQuickAuth: (returnTo?: QuickAuthReturnTarget, onSuccess?: () => void) => void;
  closeQuickAuth: () => void;
  triggerSuccess: () => void;
}

const QuickAuthContext = createContext<QuickAuthContextValue | null>(null);

export function QuickAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<QuickAuthState>({
    open: false,
    returnTo: null,
    onSuccess: null,
  });

  const openQuickAuth = useCallback((returnTo?: QuickAuthReturnTarget, onSuccess?: () => void) => {
    setState({ open: true, returnTo: returnTo ?? null, onSuccess: onSuccess ?? null });
  }, []);

  const closeQuickAuth = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const triggerSuccess = useCallback(() => {
    setState((prev) => {
      prev.onSuccess?.();
      return { open: false, returnTo: null, onSuccess: null };
    });
  }, []);

  // Écoute l'événement dispatché par useAuthGuard (ne peut pas appeler un hook directement)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ returnTo?: string }>).detail;
      openQuickAuth(detail?.returnTo);
    };
    window.addEventListener('quickauth:open', handler);
    return () => window.removeEventListener('quickauth:open', handler);
  }, [openQuickAuth]);

  return (
    <QuickAuthContext.Provider
      value={{
        isOpen: state.open,
        returnTo: state.returnTo,
        openQuickAuth,
        closeQuickAuth,
        triggerSuccess,
      }}
    >
      {children}
    </QuickAuthContext.Provider>
  );
}

export function useQuickAuth() {
  const ctx = useContext(QuickAuthContext);
  if (!ctx) throw new Error('useQuickAuth must be used inside QuickAuthProvider');
  return ctx;
}
