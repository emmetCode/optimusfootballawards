import { useMemo, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import PersonForm from '../../components/admin/PersonForm.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Loader from '../../components/ui/Loader.jsx';
import Flag from '../../components/ui/Flag.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../hooks/useToast.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { deletePerson, listPeople } from '../../services/peopleService.js';
import { deleteImage } from '../../services/storageService.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { describeError } from '../../utils/errors.js';

export default function PeopleAdminPage() {
  usePageTitle('Admin · Players and Coaches');
  const toast = useToast();
  const state = useAsync(listPeople, []);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (state.data ?? []).filter((p) => (!role || p.role === role) && (!q || p.fullName.toLowerCase().includes(q)));
  }, [state.data, search, role]);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deletePerson(toDelete.id);
      if (toDelete.photoPath) deleteImage(toDelete.photoPath).catch(() => {});
      toast.success(`${toDelete.fullName} deleted.`);
      state.reload();
    } catch (err) {
      toast.error(err.code === '23503' ? `${toDelete.fullName} is a recorded winner. Delete those winner records first.` : describeError(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <>
      <AdminPageHeader title="Players and Coaches" lead="Names, countries and photographs, reused across seasons." />
      {editing ? (
        <div className="admin-card">
          <h2 className="admin-card__title">{editing === 'new' ? 'New player or coach' : `Edit ${editing.fullName}`}</h2>
          <PersonForm
            key={editing === 'new' ? 'new' : editing.id}
            person={editing === 'new' ? null : editing}
            onSaved={() => { setEditing(null); state.reload(); }}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : (
        <div className="admin-toolbar">
          <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>Add player or coach</button>
          <input type="search" className="toolbar-input" placeholder="Search by name" aria-label="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="toolbar-input" aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option><option value="player">Players</option><option value="coach">Coaches</option>
          </select>
        </div>
      )}

      {state.status === 'error' ? (
        <ErrorState error={state.error} onRetry={state.reload} />
      ) : !state.data ? (
        <Loader />
      ) : state.data.length === 0 ? (
        <EmptyState title="No players or coaches yet" message="Add one here, or create them while adding a winner." />
      ) : visible.length === 0 ? (
        <EmptyState title="No matches" message="Try a different search or role." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Photo</th><th>Name</th><th>Role</th><th>Country</th><th className="admin-table__actions">Actions</th></tr></thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td><span className="thumb">{p.photoPath ? <img src={getImageUrl(p.photoPath)} alt="" loading="lazy" /> : <em>—</em>}</span></td>
                  <td><strong>{p.fullName}</strong></td>
                  <td>{p.role === 'coach' ? 'Coach' : 'Player'}</td>
                  <td>{p.countryCode ? <span className="cell-flag"><Flag iso={p.countryCode} name={p.countryName} /> {p.countryName}</span> : '—'}</td>
                  <td className="admin-table__actions">
                    <button type="button" className="link-button" onClick={() => setEditing(p)}>Edit</button>
                    <button type="button" className="link-button link-button--danger" onClick={() => setToDelete(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete ${toDelete?.fullName ?? ''}?`}
        message="This removes the person and their photograph. It only works if they are not a recorded winner."
        confirmLabel="Delete"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
