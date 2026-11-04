import PageHeader from '../../components/ui/PageHeader.jsx';
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import WinnerGrid from '../../components/awards/WinnerGrid.jsx';
import WinnerSkeletonGrid from '../../components/awards/WinnerSkeletonGrid.jsx';
import { useLatestWinners } from '../../hooks/useWinners.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { ROUTES } from '../../constants/routes.js';

export default function LatestPage() {
  usePageTitle('Latest Winners');
  const state = useLatestWinners();
  const season = state.data?.season;

  return (
    <>
      <PageHeader
        eyebrow="The latest awards"
        title={season?.label ?? 'Latest season'}
        lead={season ? 'Published winners for the season selected as latest.' : undefined}
      />
      <section className="section section--tight">
        <div className="container">
          <AsyncBoundary
            state={state}
            loading={<WinnerSkeletonGrid count={6} />}
            isEmpty={(data) => !data.season || data.winners.length === 0}
            empty={
              <EmptyState
                title="No winners published yet"
                message="The latest season’s winners will appear here."
              />
            }
          >
            {(data) => (
              <>
                <WinnerGrid winners={data.winners} />
                <div className="page-actions">
                  <Button to={ROUTES.seasons} variant="outline">
                    Browse all seasons
                  </Button>
                </div>
              </>
            )}
          </AsyncBoundary>
        </div>
      </section>
    </>
  );
}
