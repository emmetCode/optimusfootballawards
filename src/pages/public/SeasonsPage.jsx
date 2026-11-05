import { useSearchParams } from 'react-router-dom';
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import WinnerGrid from '../../components/awards/WinnerGrid.jsx';
import WinnerSkeletonGrid from '../../components/awards/WinnerSkeletonGrid.jsx';
import { useSeasonOptions } from '../../hooks/useSeasons.js';
import { useSeasonWinners } from '../../hooks/useWinners.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';

export default function SeasonsPage() {
  usePageTitle('Laureates');
  const [params, setParams] = useSearchParams();

  const options = useSeasonOptions();

  const seasons = options.data?.seasons ?? [];
  const requestedYear = Number(params.get('season'));
  // Selection order: ?season=YYYY → latest season with published winners → newest season.
  const selected =
    seasons.find((season) => season.startYear === requestedYear) ??
    seasons.find((season) => season.id === options.data?.latestId) ??
    seasons[0] ??
    null;
  const winnersState = useSeasonWinners(selected?.id ?? null);

  function selectSeason(startYear) {
    const next = new URLSearchParams(params);
    next.set('season', String(startYear));
    next.delete('category');
    setParams(next, { replace: true });
  }

  return (
    <>
      <header className="page-header laureates-header">
        <div className="container">
          <h1 className="laureates-header__title">Roll of Honour</h1>
        </div>
      </header>
      <section className="section section--tight season-archive">
        <div className="container">
          {options.status === 'loading' ? (
            <div className="season-archive__skeleton" role="status" aria-label="Loading seasons">
              <span className="skeleton" aria-hidden="true" />
            </div>
          ) : options.status === 'error' ? (
            <ErrorState error={options.error} onRetry={options.reload} />
          ) : seasons.length === 0 ? (
            <EmptyState title="No seasons yet" message="Seasons will appear here once they are added." />
          ) : (
            <>
              <div className="season-archive__controls">
                <label className="select season-archive__select">
                  <span>Choose a season</span>
                  <select
                    value={selected?.startYear ?? ''}
                    onChange={(event) => selectSeason(event.target.value)}
                    aria-label="Choose a season"
                  >
                    {seasons.map((season) => (
                      <option key={season.id} value={season.startYear}>
                        {season.label}{season.id === options.data?.latestId ? ' · Latest' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selected && (
                <>
                  <header className="season-results__header">
                    <div>
                      <p className="season-results__eyebrow">
                        {selected.id === options.data?.latestId ? 'Latest season' : 'Season archive'}
                      </p>
                      <h2>{selected.label}</h2>
                    </div>
                  </header>
                  <AsyncBoundary
                    state={winnersState}
                    loading={<WinnerSkeletonGrid count={8} />}
                    isEmpty={(winners) => winners.length === 0}
                    empty={
                      <EmptyState
                        title={`No winners published for ${selected.label}`}
                        message="Check back soon, or explore another season."
                      />
                    }
                  >
                    {(winners) => <WinnerGrid winners={winners} />}
                  </AsyncBoundary>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
