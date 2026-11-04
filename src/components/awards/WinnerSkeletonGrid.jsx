export default function WinnerSkeletonGrid({ count = 4, size = 'default' }) {
  return (
    <div
      className={`winner-grid ${size === 'large' ? 'winner-grid--large' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading winners"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="winner-skeleton" aria-hidden="true">
          <div className="winner-skeleton__media skeleton" />
          <div className="winner-skeleton__line skeleton" />
          <div className="winner-skeleton__line winner-skeleton__line--short skeleton" />
        </div>
      ))}
    </div>
  );
}
