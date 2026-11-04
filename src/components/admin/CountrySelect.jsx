import { COUNTRIES } from '../../constants/countries.js';
import { flagEmoji } from '../../utils/flag.js';

export default function CountrySelect({ id, value, onChange, disabled }) {
  return (
    <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} disabled={disabled}>
      <option value="">No country</option>
      {COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {flagEmoji(c.code) ? `${flagEmoji(c.code)} ` : ''}
          {c.name}
        </option>
      ))}
    </select>
  );
}
