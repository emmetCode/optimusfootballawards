import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PageShell from '../components/layout/PageShell.jsx';
import FullPageLoader from '../components/ui/FullPageLoader.jsx';
import HomePage from '../pages/public/HomePage.jsx';
import AboutPage from '../pages/public/AboutPage.jsx';
import SeasonsPage from '../pages/public/SeasonsPage.jsx';
import LatestPage from '../pages/public/LatestPage.jsx';
import NotFoundPage from '../pages/public/NotFoundPage.jsx';
import { ROUTES } from '../constants/routes.js';

// Admin code is split into its own chunk and only loaded when someone visits /admin.
const AdminRoutes = lazy(() => import('./AdminRoutes.jsx'));

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public site: navbar + footer layout */}
      <Route element={<PageShell />}>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.about} element={<AboutPage />} />
        <Route path={ROUTES.seasons} element={<SeasonsPage />} />
        <Route path={ROUTES.latest} element={<LatestPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin: not in the public navigation, no public layout */}
      <Route
        path={`${ROUTES.admin}/*`}
        element={
          <Suspense fallback={<FullPageLoader label="Loading admin" />}>
            <AdminRoutes />
          </Suspense>
        }
      />
    </Routes>
  );
}
