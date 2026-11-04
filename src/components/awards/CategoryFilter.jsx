export default function CategoryFilter({ categories, value, onChange }) {
  if (!categories.length) return null;
  return (
    <label className="select">
      <span className="sr-only">Award category</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.shortName}
          </option>
        ))}
      </select>
    </label>
  );
}
