export default function EmptyState({ title, message, action }) {
  return (
    <div className="state state--empty">
      <span className="state__mark" aria-hidden="true" />
      <h2 className="state__title">{title}</h2>
      {message && <p className="state__text">{message}</p>}
      {action}
    </div>
  );
}
