import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Loader from '../../components/ui/Loader.jsx';
import Button from '../../components/ui/Button.jsx';
import Flag from '../../components/ui/Flag.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../hooks/useToast.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { listSeasons } from '../../services/seasonsAdminService.js';
import { deleteWinnerRecord, listWinnerRecords, setWinnerStatus } from '../../services/winnersAdminService.js';
import { deleteImage } from '../../services/storageService.js';
import { describeError } from '../../utils/errors.js';

export default function WinnersAdminPage() {
  usePageTitle('Admin · Winners');
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const seasonId = params.get('season') ?? '';

  const seasons = useAsync(listSeasons, []);
  const records = useAsync(() => listWinnerRecords(seasonId || null), [seasonId]);

  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function toggleStatus(record) {
    const next = record.status === 'published' ? 'draft' : 'published';
    setBusyId(record.id);
    try {
      await setWinnerStatus(record.id, next);
      toast.success(next === 'published' ? 'Winner published.' : 'Winner unpublished.');
      records.reload();
    } catch (err) {
      toast.error(describeError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteWinnerRecord(toDelete.id);
      if (toDelete.photoPath) deleteImage(toDelete.photoPath).catch(() => {});
      toast.success('Winner record deleted.');
      records.reload();
    } catch (err) {
      toast.error(describeError(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  const newLink = seasonId ? `/admin/winners/new?season=${seasonId}` : '/admin/winners/new';

  return (
    <>
      <AdminPageHeader title="Winners" lead="Add, edit, publish or remove award winners. Only published winners appear on the website." />
      <div className="admin-toolbar">
        <Button to={newLink}>Add winner</Button>
        <select
          className="toolbar-input"
          aria-label="Filter by season"
          value={seasonId}
          onChange={(e) => setParams(e.target.value ? { season: e.target.value } : {}, { replace: true })}
        >
          <option value="">All seasons</option>
          {(seasons.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {records.status === 'error' ? (
        <ErrorState error={records.error} onRetry={records.reload} />
      ) : !records.data ? (
        <Loader />
      ) : records.data.length === 0 ? (
        <EmptyState title="No winners yet" message="Add the first winner to get started." action={<Button to={newLink}>Add winner</Button>} />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Season</th><th>Category</th><th>Winner</th><th>Status</th><th className="admin-table__actions">Actions</th></tr></thead>
            <tbody>
              {records.data.map((r) => {
                const isTeam = r.category?.winnerType === 'team';
                const name = isTeam ? r.team?.name : r.person?.fullName;
                const iso = r.person?.countryCode ?? r.team?.countryCode;
                return (
                  <tr key={r.id}>
                    <td>{r.seasonLabel}</td>
                    <td>{r.category?.shortName}</td>
                    <td>
                      <strong>{name}</strong> {iso && <Flag iso={iso} name={r.person?.countryName ?? r.team?.countryName} />}
                      {!isTeam && r.team && <div className="cell-sub">{r.team.name}</div>}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="admin-table__actions">
                      <Link className="link-button" to={`/admin/winners/${r.id}`}>Edit</Link>
                      <button type="button" className="link-button" onClick={() => toggleStatus(r)} disabled={busyId === r.id}>
                        {r.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button type="button" className="link-button link-button--danger" onClick={() => setToDelete(r)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this winner record?"
        message={`${toDelete?.category?.shortName ?? ''} for ${toDelete?.seasonLabel ?? ''} will be permanently deleted. The person and club are kept.`}
        confirmLabel="Delete winner"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
