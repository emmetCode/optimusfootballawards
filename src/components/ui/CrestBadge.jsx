function initials(name = '') {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((w) => w[0].toUpperCase()).join('');
}

// Simple generated badge used when a club has no uploaded logo.
export default function CrestBadge({ name, size = 24 }) {
  return (
    <span className="crest-badge" style={{ '--crest-size': `${size}px` }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
