// Turns an ISO code into a flag emoji. Returns null when no emoji exists (e.g. Northern Ireland).
const SUBDIVISION_TAGS = { ENG: 'gbeng', SCT: 'gbsct', WLS: 'gbwls' };

export function flagEmoji(code) {
  if (!code) return null;
  const c = code.toUpperCase();

  if (SUBDIVISION_TAGS[c]) {
    const tags = [...SUBDIVISION_TAGS[c]].map((ch) => String.fromCodePoint(0xe0000 + ch.charCodeAt(0))).join('');
    return String.fromCodePoint(0x1f3f4) + tags + String.fromCodePoint(0xe007f);
  }
  if (/^[A-Z]{2}$/.test(c)) {
    return [...c].map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65)).join('');
  }
  return null;
}
