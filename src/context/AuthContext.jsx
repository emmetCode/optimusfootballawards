import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  checkIsAdmin,
  getCurrentSession,
  signInWithPassword,
  signOutUser,
  subscribeToAuth,
} from '../services/authService.js';

export const AuthContext = createContext(null);

// Only mounted around the /admin routes, so public pages never touch auth.
export function AuthProvider({ children }) {
  // undefined = still reading the stored session; null = signed out
  const [session, setSession] = useState(undefined);
  const [admin, setAdmin] = useState({ userId: null, isAdmin: false, checking: false, error: null });

  useEffect(() => {
    let active = true;
    getCurrentSession()
      .then((s) => active && setSession(s))
      .catch(() => active && setSession(null));
    const unsubscribe = subscribeToAuth((s) => active && setSession(s));
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const sessionReady = session !== undefined;
  const userId = session?.user?.id ?? null;

  // Verify admin rights with the database whenever the signed-in user changes.
  useEffect(() => {
    if (!sessionReady) return undefined;
    if (!userId) {
      setAdmin({ userId: null, isAdmin: false, checking: false, error: null });
      return undefined;
    }
    let cancelled = false;
    setAdmin((prev) => ({ ...prev, checking: true, error: null }));
    checkIsAdmin()
      .then((isAdmin) => !cancelled && setAdmin({ userId, isAdmin, checking: false, error: null }))
      .catch((error) => !cancelled && setAdmin({ userId, isAdmin: false, checking: false, error }));
    return () => {
      cancelled = true;
    };
  }, [sessionReady, userId]);

  const signIn = useCallback((email, password) => signInWithPassword(email, password), []);
  const signOut = useCallback(async () => {
    await signOutUser();
    setSession(null);
  }, []);

  const loading = !sessionReady || (userId !== null && (admin.userId !== userId || admin.checking));

  const value = useMemo(
    () => ({
      session: session ?? null,
      user: session?.user ?? null,
      isAdmin: !loading && admin.isAdmin,
      adminError: admin.error,
      loading,
      signIn,
      signOut,
    }),
    [session, admin, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
