import Button from './Button.jsx';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <h2 className="state__title">We couldn’t load the awards</h2>
      <p className="state__text">Please check your connection and try again.</p>
      {import.meta.env.DEV && error?.message && <p className="state__debug">{error.message}</p>}
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
