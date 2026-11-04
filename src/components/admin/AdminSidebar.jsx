import { NavLink } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import { ADMIN_ROUTES } from '../../constants/routes.js';

const NAV_ITEMS = [
  { to: ADMIN_ROUTES.dashboard, label: 'Dashboard', end: true },
  { to: ADMIN_ROUTES.winners, label: 'Winners' },
  { to: ADMIN_ROUTES.seasons, label: 'Seasons' },
  { to: ADMIN_ROUTES.categories, label: 'Award Categories' },
  { to: ADMIN_ROUTES.people, label: 'Players and Coaches' },
  { to: ADMIN_ROUTES.clubs, label: 'Clubs and Teams' },
  { to: ADMIN_ROUTES.images, label: 'Images' },
];

export default function AdminSidebar({ email, open, onToggle, onSignOut, signingOut }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__head">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__wordmark">
            <strong>Optimus</strong> Awards
          </span>
          <span className="admin-sidebar__tag">Admin</span>
        </div>
        <button
          type="button"
          className="admin-sidebar__toggle"
          aria-expanded={open}
          aria-controls="admin-panel"
          onClick={onToggle}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className={`navbar__bars ${open ? 'is-open' : ''}`} aria-hidden="true" />
        </button>
      </div>

      <div id="admin-panel" className={`admin-sidebar__panel ${open ? 'is-open' : ''}`}>
        <nav className="admin-nav" aria-label="Admin">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav__link ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__user">
          <span className="admin-sidebar__email">{email}</span>
          <Button variant="outline" className="btn--small" onClick={onSignOut} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </div>
    </aside>
  );
}
