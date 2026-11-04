import { useMemo, useState } from 'react';

// Select an existing record, or create/edit one inline without leaving the page.
// `items`: [{ id, label }]. `renderForm({ mode, onDone, onCancel })` supplies the create/edit form.
export default function EntityPicker({ id, label, items, value, onChange, renderForm, noun, disabled }) {
  const [mode, setMode] = useState('idle'); // idle | create | edit
  const [filter, setFilter] = useState('');

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items;
    // Always keep the current selection in the list so the select never goes blank.
    const selected = items.find((i) => i.id === value);
    return selected && !list.includes(selected) ? [selected, ...list] : list;
  }, [items, filter, value]);

  function finish(entity) {
    setMode('idle');
    if (entity) onChange(entity.id);
  }

  return (
    <div className="picker">
      <label htmlFor={id} className="picker__label">{label}</label>
      <div className="picker__row">
        {items.length > 12 && (
          <input
            type="search"
            className="picker__filter"
            placeholder={`Search ${noun}s`}
            aria-label={`Search ${noun}s`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            disabled={disabled}
          />
        )}
        <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} disabled={disabled}>
          <option value="">{items.length ? `Choose a ${noun}…` : `No ${noun}s yet`}</option>
          {visible.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn--outline btn--small" onClick={() => setMode('create')} disabled={disabled || mode !== 'idle'}>
          New
        </button>
        {value && (
          <button type="button" className="btn btn--outline btn--small" onClick={() => setMode('edit')} disabled={disabled || mode !== 'idle'}>
            Edit
          </button>
        )}
      </div>
      {mode !== 'idle' && (
        <div className="picker__panel">
          <h3 className="picker__panel-title">{mode === 'create' ? `New ${noun}` : `Edit ${noun}`}</h3>
          {renderForm({ mode, onDone: finish, onCancel: () => setMode('idle') })}
        </div>
      )}
    </div>
  );
}
