import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // Keep the admin area out of search engines.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut(); // ProtectedRoute then sends the user to the login page.
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <div className="admin-shell">
      <AdminSidebar
        email={user?.email}
        open={open}
        onToggle={() => setOpen((o) => !o)}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
