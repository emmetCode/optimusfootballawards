import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import LoginPage from '../pages/admin/LoginPage.jsx';
import DashboardPage from '../pages/admin/DashboardPage.jsx';
import WinnersAdminPage from '../pages/admin/WinnersAdminPage.jsx';
import WinnerEditPage from '../pages/admin/WinnerEditPage.jsx';
import SeasonsAdminPage from '../pages/admin/SeasonsAdminPage.jsx';
import CategoriesAdminPage from '../pages/admin/CategoriesAdminPage.jsx';
import PeopleAdminPage from '../pages/admin/PeopleAdminPage.jsx';
import ClubsAdminPage from '../pages/admin/ClubsAdminPage.jsx';
import ImagesAdminPage from '../pages/admin/ImagesAdminPage.jsx';
import AdminNotFoundPage from '../pages/admin/AdminNotFoundPage.jsx';

import '../styles/admin.css';

// Loaded lazily (see routes/index.jsx) so visitors never download admin code.
// Paths here are relative to /admin.
export default function AdminRoutes() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="winners" element={<WinnersAdminPage />} />
              <Route path="winners/new" element={<WinnerEditPage />} />
              <Route path="winners/:id" element={<WinnerEditPage />} />
              <Route path="seasons" element={<SeasonsAdminPage />} />
              <Route path="categories" element={<CategoriesAdminPage />} />
              <Route path="people" element={<PeopleAdminPage />} />
              <Route path="clubs" element={<ClubsAdminPage />} />
              <Route path="images" element={<ImagesAdminPage />} />
              <Route path="*" element={<AdminNotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
