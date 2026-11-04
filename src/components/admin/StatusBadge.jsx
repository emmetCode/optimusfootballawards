export default function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{status === 'published' ? 'Published' : 'Draft'}</span>;
}
