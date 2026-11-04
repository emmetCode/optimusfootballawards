export default function SeasonSelector({ seasons, value, onChange }) {
  return (
    <label className="select select--season">
      <span className="sr-only">Season</span>
      <select value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))}>
        {seasons.map((season) => (
          <option key={season.id} value={season.startYear}>
            {season.label}
          </option>
        ))}
      </select>
    </label>
  );
}
