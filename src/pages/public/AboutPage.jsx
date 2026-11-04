import PageHeader from '../../components/ui/PageHeader.jsx';
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import CategoryCard from '../../components/awards/CategoryCard.jsx';
import { useCategories } from '../../hooks/useCategories.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';

function CategorySkeleton() {
  return (
    <div className="award-editorial-list" role="status" aria-label="Loading award categories">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="award-editorial-skeleton" aria-hidden="true">
          <span className="skeleton" />
          <span className="skeleton" />
        </div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  usePageTitle('The Awards');
  const state = useCategories();

  return (
    <>
      <PageHeader
        eyebrow="The Awards"
        lead="Distinct honours for the performances, people and teams that shape a football season."
      />
      <section className="section award-editorial">
        <div className="container award-editorial__container">
          <AsyncBoundary
            state={state}
            loading={<CategorySkeleton />}
            isEmpty={(categories) => categories.length === 0}
            empty={<EmptyState title="No categories yet" message="Award categories will appear here." />}
          >
            {(categories) => (
              <div className="award-editorial-list">
                {categories.map((category) => (
                  <CategoryCard key={category.slug} category={category} />
                ))}
              </div>
            )}
          </AsyncBoundary>
        </div>
      </section>
    </>
  );
}
