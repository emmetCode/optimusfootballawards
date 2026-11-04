import { useState } from 'react';
import Button from '../ui/Button.jsx';
import { ROUTES } from '../../constants/routes.js';
import { SITE_NAME } from '../../constants/config.js';

export default function Hero() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <h1 className="hero__title">{SITE_NAME}</h1>
          <p className="hero__slogan">Football’s finest in every position, recognised.</p>
          <div className="hero__actions">
            <Button to={ROUTES.latest} variant="primary">
              Latest winners
            </Button>
            <Button to={ROUTES.seasons} variant="outline">
              Explore history
            </Button>
          </div>
        </div>

        <div className="hero__media">
          {!imageFailed ? (
            <img
              className="hero__image"
              src="/images/OFA-award.png"
              alt="The Optimus Football Awards trophy"
              fetchpriority="high"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="hero__fallback" role="img" aria-label="Official award photograph">
              <span aria-hidden="true">THE OPTIMUS AWARDS</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
