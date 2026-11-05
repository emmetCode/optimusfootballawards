import { useState } from 'react';
import Flag from '../ui/Flag.jsx';
import CrestBadge from '../ui/CrestBadge.jsx';

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function WinnerCard({ winner, size = 'default' }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [teamLogoFailed, setTeamLogoFailed] = useState(false);
  const {
    name,
    categoryName,
    winnerType,
    photoUrl,
    teamName,
    teamLogoUrl,
    countryName,
    countryIso,
  } = winner;

  const isTeam = winnerType === 'team';
  const photo = photoUrl && !photoFailed ? photoUrl : null;
  const usableTeamLogo = teamLogoUrl && !teamLogoFailed;
  const logoAsMain = !photo && isTeam && usableTeamLogo;

  return (
    <article className={`winner-card winner-card--${size}`} aria-label={`${categoryName}: ${name}`}>
      <div className="winner-card__media">
        {photo ? (
          <img className="winner-card__img" src={photo} alt={name} loading="lazy" onError={() => setPhotoFailed(true)} />
        ) : logoAsMain ? (
          <img
            className="winner-card__img winner-card__img--logo"
            src={teamLogoUrl}
            alt={`${name} crest`}
            loading="lazy"
            onError={() => setTeamLogoFailed(true)}
          />
        ) : (
          <span className="winner-card__monogram" aria-hidden="true">
            {initials(name)}
          </span>
        )}
      </div>

      <div className="winner-card__body">
        <h3 className="winner-card__name">{name}</h3>
        <div className="winner-card__meta">
          {!isTeam && teamName && (
            <span className="winner-card__team">
              {usableTeamLogo ? (
                <img
                  className="winner-card__crest"
                  src={teamLogoUrl}
                  alt=""
                  loading="lazy"
                  onError={() => setTeamLogoFailed(true)}
                />
              ) : (
                <CrestBadge name={teamName} />
              )}
              <span>{teamName}</span>
            </span>
          )}
          <Flag iso={countryIso} name={countryName} className="winner-card__country" />
        </div>
        <span className="winner-card__label">{categoryName}</span>
      </div>
    </article>
  );
}
