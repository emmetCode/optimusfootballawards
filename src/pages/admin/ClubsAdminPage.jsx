import { useMemo, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import ClubForm from '../../components/admin/ClubForm.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Loader from '../../components/ui/Loader.jsx';
import Flag from '../../components/ui/Flag.jsx';
import CrestBadge from '../../components/ui/CrestBadge.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../hooks/useToast.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { deleteClub, listClubs } from '../../services/clubsService.js';
import { deleteImage } from '../../services/storageService.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { describeError } from '../../utils/errors.js';

export default function ClubsAdminPage() {
  usePageTitle('Admin · Clubs and Teams');
  const toast = useToast();
  const state = useAsync(listClubs, []);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (state.data ?? []).filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [state.data, search]);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteClub(toDelete.id);
      if (toDelete.logoPath) deleteImage(toDelete.logoPath).catch(() => {});
      toast.success(`${toDelete.name} deleted.`);
      state.reload();
    } catch (err) {
      toast.error(err.code === '23503' ? `${toDelete.name} is used by winner records. Change or delete those first.` : describeError(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <>
      <AdminPageHeader title="Clubs and Teams" lead="Clubs and national teams with their country and optional logo." />
      {editing ? (
        <div className="admin-card">
          <h2 className="admin-card__title">{editing === 'new' ? 'New club or team' : `Edit ${editing.name}`}</h2>
          <ClubForm
            key={editing === 'new' ? 'new' : editing.id}
            club={editing === 'new' ? null : editing}
            onSaved={() => { setEditing(null); state.reload(); }}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : (
        <div className="admin-toolbar">
          <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>Add club or team</button>
          <input type="search" className="toolbar-input" placeholder="Search by name" aria-label="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      )}

      {state.status === 'error' ? (
        <ErrorState error={state.error} onRetry={state.reload} />
      ) : !state.data ? (
        <Loader />
      ) : state.data.length === 0 ? (
        <EmptyState title="No clubs or teams yet" message="Add one here, or create them while adding a winner." />
      ) : visible.length === 0 ? (
        <EmptyState title="No matches" message="Try a different search." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Badge</th><th>Name</th><th>Type</th><th>Country</th><th className="admin-table__actions">Actions</th></tr></thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id}>
                  <td>{c.logoPath ? <span className="thumb thumb--square"><img src={getImageUrl(c.logoPath)} alt="" loading="lazy" /></span> : <CrestBadge name={c.name} size={36} />}</td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.kind === 'national_team' ? 'National team' : 'Club'}</td>
                  <td>{c.countryCode ? <span className="cell-flag"><Flag iso={c.countryCode} name={c.countryName} /> {c.countryName}</span> : '—'}</td>
                  <td className="admin-table__actions">
                    <button type="button" className="link-button" onClick={() => setEditing(c)}>Edit</button>
                    <button type="button" className="link-button link-button--danger" onClick={() => setToDelete(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete ${toDelete?.name ?? ''}?`}
        message="This removes the club or team and its logo. It only works if no winner record uses it."
        confirmLabel="Delete"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
