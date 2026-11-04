import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import { ADMIN_ROUTES } from '../../constants/routes.js';

export default function AdminNotFoundPage() {
  return (
    <>
      <AdminPageHeader title="Page not found" />
      <EmptyState
        title="That admin page doesn’t exist"
        action={<Button to={ADMIN_ROUTES.dashboard}>Back to dashboard</Button>}
      />
    </>
  );
}
