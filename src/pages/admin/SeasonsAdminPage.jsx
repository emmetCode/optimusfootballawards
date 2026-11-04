import { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import Field from '../../components/ui/Field.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Loader from '../../components/ui/Loader.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../hooks/useToast.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { deleteSeason, listSeasons, saveSeason } from '../../services/seasonsAdminService.js';
import { describeError } from '../../utils/errors.js';

const labelFor = (year) => `${year}–${String((year + 1) % 100).padStart(2, '0')}`;

function SeasonForm({ season, onSaved, onCancel }) {
  const toast = useToast();
  const [year, setYear] = useState(String(season?.startYear ?? new Date().getFullYear()));
  const [pinned, setPinned] = useState(season?.isLatestOverride ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startYear = Number(year);
  const valid = Number.isInteger(startYear) && startYear >= 1900 && startYear <= 2100;

  async function handleSave() {
    if (!valid) {
      setError('Enter a start year between 1900 and 2100.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await saveSeason({ id: season?.id, startYear, isLatestOverride: pinned });
      toast.success(season ? 'Season updated.' : `Season ${saved.label} created.`);
      onSaved();
    } catch (err) {
      setError(err.code === '23505' ? 'That season already exists.' : describeError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card admin-form">
      <h2 className="admin-card__title">{season ? 'Edit season' : 'New season'}</h2>
      <Field label="Start year" htmlFor="season-year" hint={valid ? `Label: ${labelFor(startYear)}` : 'For example 2024 creates the 2024–25 season.'}>
        <input id="season-year" type="number" min="1900" max="2100" step="1" value={year} onChange={(e) => setYear(e.target.value)} disabled={saving} />
      </Field>
      <label className="check">
        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} disabled={saving} />
        <span>
          Pin as the latest season
          <small>Normally the newest season with published winners is “latest” automatically. Pinning overrides that (only one season can be pinned).</small>
        </span>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="admin-form__actions">
        <button type="button" className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : season ? 'Save changes' : 'Create season'}
        </button>
        <button type="button" className="btn btn--outline" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </div>
  );
}

export default function SeasonsAdminPage() {
  usePageTitle('Admin · Seasons');
  const toast = useToast();
  const state = useAsync(listSeasons, []);
  const [editing, setEditing] = useState(null); // null | 'new' | season
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteSeason(toDelete.id);
      toast.success(`Season ${toDelete.label} deleted.`);
      setToDelete(null);
      state.reload();
    } catch (err) {
      toast.error(err.code === '23503' ? 'This season has winner records. Delete those first.' : describeError(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AdminPageHeader title="Seasons" lead="Create the football seasons that winners belong to." />
      {editing ? (
        <SeasonForm
          key={editing === 'new' ? 'new' : editing.id}
          season={editing === 'new' ? null : editing}
          onSaved={() => { setEditing(null); state.reload(); }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div className="admin-toolbar">
          <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>Add season</button>
        </div>
      )}

      {state.status === 'error' ? (
        <ErrorState error={state.error} onRetry={state.reload} />
      ) : !state.data ? (
        <Loader />
      ) : state.data.length === 0 ? (
        <EmptyState title="No seasons yet" message="Add your first season to start recording winners." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Season</th><th>Latest</th><th className="admin-table__actions">Actions</th></tr></thead>
            <tbody>
              {state.data.map((season) => (
                <tr key={season.id}>
                  <td><strong>{season.label}</strong></td>
                  <td>{season.isLatestOverride ? <span className="badge badge--published">Pinned</span> : '—'}</td>
                  <td className="admin-table__actions">
                    <button type="button" className="link-button" onClick={() => setEditing(season)}>Edit</button>
                    <button type="button" className="link-button link-button--danger" onClick={() => setToDelete(season)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this season?"
        message={`Season ${toDelete?.label ?? ''} will be permanently deleted. This only works if it has no winner records.`}
        confirmLabel="Delete season"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
