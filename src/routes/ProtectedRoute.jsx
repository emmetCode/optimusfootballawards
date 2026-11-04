import { Navigate, Outlet, useLocation } from 'react-router-dom';
import FullPageLoader from '../components/ui/FullPageLoader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { ROUTES } from '../constants/routes.js';

// UX guard only. The real protection is RLS + Storage policies in Supabase.
export default function ProtectedRoute() {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader label="Checking access" />;
  if (!isAdmin) return <Navigate to={ROUTES.adminLogin} replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
