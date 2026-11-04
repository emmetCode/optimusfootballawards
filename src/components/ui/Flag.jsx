import { flagEmoji } from '../../utils/flag.js';

// Country flag drawn as an emoji icon. Falls back to the ISO code where no emoji exists.
export default function Flag({ iso, name, className = '' }) {
  if (!iso) return null;
  const emoji = flagEmoji(iso);
  if (!emoji) {
    return (
      <span className={`flag-code ${className}`} title={name ?? iso}>
        {iso}
      </span>
    );
  }
  return (
    <span className={`flag ${className}`} role="img" aria-label={name ?? iso} title={name ?? iso}>
      {emoji}
    </span>
  );
}
