import { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import Field from '../../components/ui/Field.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../hooks/useToast.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { listAllCategories, saveCategory } from '../../services/categoriesAdminService.js';
import { describeError } from '../../utils/errors.js';

const GROUPS = ['goalkeeper', 'defence', 'midfield', 'attack', 'team', 'staff'];
const TYPE_LABELS = { player: 'Player', coach: 'Coach', team: 'Team' };
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function CategoryForm({ category, nextSortOrder, onSaved, onCancel }) {
  const toast = useToast();
  const isNew = !category;
  const [name, setName] = useState(category?.name ?? '');
  const [shortName, setShortName] = useState(category?.shortName ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(false);
  const [winnerType, setWinnerType] = useState(category?.winnerType ?? 'player');
  const [positionGroup, setPositionGroup] = useState(category?.positionGroup ?? 'midfield');
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? nextSortOrder));
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!name.trim() || !shortName.trim()) return setError('Please enter the full and short names.');
    if (isNew && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return setError('The URL name can only use lowercase letters, numbers and hyphens.');
    if (!Number.isInteger(Number(sortOrder))) return setError('Order must be a whole number.');
    setSaving(true);
    setError('');
    try {
      await saveCategory({ id: category?.id, slug, name, shortName, winnerType, positionGroup, sortOrder: Number(sortOrder), isActive });
      toast.success(isNew ? 'Category created.' : 'Category updated.');
      onSaved();
    } catch (err) {
      setError(err.code === '23505' ? 'A category with that URL name already exists.' : describeError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card admin-form">
      <h2 className="admin-card__title">{isNew ? 'New category' : `Edit ${category.shortName}`}</h2>
      <Field label="Full name" htmlFor="cat-name"><input id="cat-name" value={name} placeholder="The Optimus Winger of the Season" onChange={(e) => setName(e.target.value)} disabled={saving} /></Field>
      <Field label="Short name" htmlFor="cat-short" hint="Shown on cards and filters, for example “Goalkeeper”.">
        <input
          id="cat-short"
          value={shortName}
          onChange={(e) => {
            setShortName(e.target.value);
            if (isNew && !slugTouched) setSlug(slugify(e.target.value));
          }}
          disabled={saving}
        />
      </Field>
      {isNew ? (
        <>
          <Field label="URL name" htmlFor="cat-slug" hint="Used in links such as /seasons?category=winger. Cannot be changed later.">
            <input id="cat-slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} disabled={saving} />
          </Field>
          <Field label="Winner type" htmlFor="cat-type" hint="Cannot be changed later.">
            <select id="cat-type" value={winnerType} onChange={(e) => setWinnerType(e.target.value)} disabled={saving}>
              <option value="player">Player</option><option value="coach">Coach</option><option value="team">Team</option>
            </select>
          </Field>
        </>
      ) : (
        <p className="field__hint">URL name: <code>{category.slug}</code> · Type: {TYPE_LABELS[category.winnerType]} (fixed)</p>
      )}
      <Field label="Position group" htmlFor="cat-group">
        <select id="cat-group" value={positionGroup} onChange={(e) => setPositionGroup(e.target.value)} disabled={saving}>
          {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </Field>
      <Field label="Display order" htmlFor="cat-order"><input id="cat-order" type="number" step="1" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} disabled={saving} /></Field>
      <label className="check">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={saving} />
        <span>Active<small>Inactive categories are hidden from the public “The Awards” page. Existing winners are not deleted.</small></span>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="admin-form__actions">
        <button type="button" className="btn btn--primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        <button type="button" className="btn btn--outline" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </div>
  );
}

export default function CategoriesAdminPage() {
  usePageTitle('Admin · Award Categories');
  const state = useAsync(listAllCategories, []);
  const [editing, setEditing] = useState(null);
  const nextSort = (state.data?.reduce((m, c) => Math.max(m, c.sortOrder), 0) ?? 0) + 1;

  return (
    <>
      <AdminPageHeader title="Award Categories" lead="The ten predefined categories. You can rename, reorder, hide or add categories." />
      {editing ? (
        <CategoryForm
          key={editing === 'new' ? 'new' : editing.id}
          category={editing === 'new' ? null : editing}
          nextSortOrder={nextSort}
          onSaved={() => { setEditing(null); state.reload(); }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div className="admin-toolbar"><button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>Add category</button></div>
      )}
      {state.status === 'error' ? (
        <ErrorState error={state.error} onRetry={state.reload} />
      ) : !state.data ? (
        <Loader />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Category</th><th>Type</th><th>Status</th><th className="admin-table__actions">Actions</th></tr></thead>
            <tbody>
              {state.data.map((c) => (
                <tr key={c.id}>
                  <td>{c.sortOrder}</td>
                  <td><strong>{c.shortName}</strong><div className="cell-sub">{c.name}</div></td>
                  <td>{TYPE_LABELS[c.winnerType]}</td>
                  <td><span className={`badge ${c.isActive ? 'badge--published' : 'badge--draft'}`}>{c.isActive ? 'Active' : 'Hidden'}</span></td>
                  <td className="admin-table__actions"><button type="button" className="link-button" onClick={() => setEditing(c)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
