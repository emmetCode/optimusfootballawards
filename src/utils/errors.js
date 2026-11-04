// Turns Supabase/Postgres errors into short messages a non-technical owner can act on.
export function describeError(error) {
  if (!error) return 'Something went wrong. Please try again.';
  const code = error.code;
  if (code === '23505') return 'That record already exists.';
  if (code === '23503') return 'This item is still used by other records. Remove or change those first.';
  if (code === '42501' || /row-level security/i.test(error.message ?? '')) {
    return 'You don’t have permission to do that. Try signing in again.';
  }
  if (/Failed to fetch|NetworkError/i.test(error.message ?? '')) {
    return 'Network problem. Check your connection and try again.';
  }
  return error.message || 'Something went wrong. Please try again.';
}
