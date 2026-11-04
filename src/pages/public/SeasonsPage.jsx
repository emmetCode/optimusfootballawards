import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Button from '../../components/ui/Button.jsx';
import CategoryFilter from '../../components/awards/CategoryFilter.jsx';
import WinnerGrid from '../../components/awards/WinnerGrid.jsx';
import WinnerSkeletonGrid from '../../components/awards/WinnerSkeletonGrid.jsx';
import { useSeasonOptions } from '../../hooks/useSeasons.js';
import { useSeasonWinners } from '../../hooks/useWinners.js';
import { useCategories } from '../../hooks/useCategories.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';

export default function SeasonsPage() {
  usePageTitle('History');
  const [params, setParams] = useSearchParams();

  const options = useSeasonOptions();
  const categories = useCategories();

  const seasons = options.data?.seasons ?? [];
  const requestedYear = Number(params.get('season'));
  // Selection order: ?season=YYYY → latest season with published winners → newest season.
  const selected =
    seasons.find((season) => season.startYear === requestedYear) ??
    seasons.find((season) => season.id === options.data?.latestId) ??
    seasons[0] ??
    null;
  const categorySlug = params.get('category') ?? '';
  const winnersState = useSeasonWinners(selected?.id ?? null);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  return (
    <>
      <PageHeader eyebrow="The archive" title="History" lead="Explore published awards by season.">
        {(categories.data?.length ?? 0) > 0 && (
          <div className="controls">
            <CategoryFilter
              categories={categories.data}
              value={categorySlug}
              onChange={(slug) => updateParam('category', slug)}
            />
          </div>
        )}
      </PageHeader>
      <section className="section section--tight season-archive">
        <div className="container">
          {options.status === 'loading' ? (
            <div className="season-archive__skeleton" role="status" aria-label="Loading seasons">
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index} className="skeleton" aria-hidden="true" />
              ))}
            </div>
          ) : options.status === 'error' ? (
            <ErrorState error={options.error} onRetry={options.reload} />
          ) : seasons.length === 0 ? (
            <EmptyState title="No seasons yet" message="Seasons will appear here once they are added." />
          ) : (
            <>
              <div className="season-archive__list" role="group" aria-label="Choose a season">
                {seasons.map((season) => {
                  const isLatest = season.id === options.data?.latestId;
                  const isSelected = season.id === selected?.id;
                  return (
                    <button
                      key={season.id}
                      type="button"
                      className={`season-option${isSelected ? ' is-selected' : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => updateParam('season', String(season.startYear))}
                    >
                      <span className="season-option__eyebrow">
                        {isLatest ? 'Latest season' : 'Season'}
                      </span>
                      <span className="season-option__label">{season.label}</span>
                    </button>
                  );
                })}
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
                    {(winners) => {
                      const visible = categorySlug
                        ? winners.filter((winner) => winner.categorySlug === categorySlug)
                        : winners;
                      return visible.length > 0 ? (
                        <WinnerGrid winners={visible} />
                      ) : (
                        <EmptyState
                          title="No winner in this category"
                          message="Try another category or season."
                          action={
                            <Button variant="outline" onClick={() => updateParam('category', '')}>
                              Show all categories
                            </Button>
                          }
                        />
                      );
                    }}
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
