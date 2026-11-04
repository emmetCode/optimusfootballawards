import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/admin/LoginForm.jsx';
import Button from '../../components/ui/Button.jsx';
import FullPageLoader from '../../components/ui/FullPageLoader.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { friendlyAuthError } from '../../services/authService.js';
import { ROUTES } from '../../constants/routes.js';

export default function LoginPage() {
  usePageTitle('Admin sign in');
  const { session, isAdmin, loading, adminError, signIn, signOut } = useAuth();
  const location = useLocation();
  const from = location.state?.from ?? ROUTES.admin;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <FullPageLoader label="Checking access" />;
  if (isAdmin) return <Navigate to={from} replace />;

  async function handleSubmit({ email, password }) {
    setSubmitting(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  let content;
  if (session && adminError) {
    content = (
      <>
        <p className="form-error" role="alert">
          We couldn’t verify your access. Please try again.
        </p>
        <Button variant="outline" className="btn--block" onClick={signOut}>
          Sign out
        </Button>
      </>
    );
  } else if (session) {
    content = (
      <>
        <p className="form-error" role="alert">
          This account does not have administrator access.
        </p>
        <Button variant="outline" className="btn--block" onClick={signOut}>
          Sign out
        </Button>
      </>
    );
  } else {
    content = <LoginForm onSubmit={handleSubmit} submitting={submitting} error={error} />;
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-card__brand">
          <strong>Optimus</strong> Awards
        </p>
        <h1 className="auth-card__title">Admin sign in</h1>
        {content}
        <Link to={ROUTES.home} className="auth-card__back">
          ← Back to the website
        </Link>
      </div>
    </main>
  );
}
