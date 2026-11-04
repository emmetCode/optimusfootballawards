import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { fetchDashboardCounts } from '../../services/adminService.js';

const STATS = [
  { key: 'published', label: 'Published winners' },
  { key: 'drafts', label: 'Draft winners' },
  { key: 'seasons', label: 'Seasons' },
  { key: 'people', label: 'Players and coaches' },
  { key: 'clubs', label: 'Clubs and teams' },
];

export default function DashboardPage() {
  usePageTitle('Admin · Dashboard');
  const state = useAsync(fetchDashboardCounts, []);

  return (
    <>
      <AdminPageHeader title="Dashboard" lead="A live overview of your awards data." />
      <div className="admin-toolbar">
        <Button to="/admin/winners/new">Add winner</Button>
        <Button to="/admin/winners" variant="outline">Manage winners</Button>
      </div>
      <AsyncBoundary state={state}>
        {(counts) => (
          <div className="admin-stats">
            {STATS.map((stat) => (
              <div key={stat.key} className="stat-card">
                <span className="stat-card__value">{counts[stat.key]}</span>
                <span className="stat-card__label">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </AsyncBoundary>
    </>
  );
}
