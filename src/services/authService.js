import { supabase } from '../lib/supabaseClient.js';

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session ?? null;
}

// Calls back with the session whenever the user signs in, signs out or the token refreshes.
// Returns an unsubscribe function.
export function subscribeToAuth(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session ?? null));
  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Asks the database itself. This is the same is_admin() function the RLS policies use,
// so the UI can never disagree with what Supabase will actually allow.
export async function checkIsAdmin() {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) throw error;
  return data === true;
}

export function friendlyAuthError(error) {
  if (error?.status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (error?.status === 400 || error?.code === 'invalid_credentials') return 'Incorrect email or password.';
  if (error?.name === 'AuthRetryableFetchError') return 'Network problem. Check your connection and try again.';
  return 'We couldn’t sign you in. Please try again.';
}
