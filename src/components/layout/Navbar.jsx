import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';

const LINKS = [
  { to: ROUTES.home, label: 'Home', end: true },
  { to: ROUTES.about, label: 'The Awards' },
  { to: ROUTES.seasons, label: 'Laureates' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to={ROUTES.home} className="wordmark" aria-label="The Optimus Football Awards — home">
          <img className="wordmark__logo" src="/images/logo.png" alt="The Optimus Football Awards" />
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className={`navbar__bars ${open ? 'is-open' : ''}`} aria-hidden="true" />
        </button>

        <nav id="primary-nav" className={`navbar__nav ${open ? 'is-open' : ''}`} aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
