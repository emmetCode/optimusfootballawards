import { SITE_NAME } from '../../constants/config.js';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Link to={ROUTES.home} className="footer__name">{SITE_NAME}</Link>
        <nav className="footer__nav" aria-label="Footer">
          <Link to={ROUTES.about}>The Awards</Link>
          <Link to={ROUTES.seasons}>History</Link>
          <Link to={ROUTES.latest}>Latest Winners</Link>
        </nav>
        <span className="footer__copy">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
