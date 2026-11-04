import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { ROUTES } from '../../constants/routes.js';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <section className="section">
      <div className="container">
        <EmptyState
          title="Page not found"
          message="The page you’re looking for doesn’t exist."
          action={<Button to={ROUTES.home}>Back to home</Button>}
        />
      </div>
    </section>
  );
}
