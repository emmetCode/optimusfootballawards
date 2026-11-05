import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import ClubForm from '../../components/admin/ClubForm.jsx';
import EntityPicker from '../../components/admin/EntityPicker.jsx';
import ImageUpload from '../../components/admin/ImageUpload.jsx';
import PersonForm from '../../components/admin/PersonForm.jsx';
import WinnerCard from '../../components/awards/WinnerCard.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Field from '../../components/ui/Field.jsx';
import Flag from '../../components/ui/Flag.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../hooks/useToast.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { listSeasons } from '../../services/seasonsAdminService.js';
import { listAllCategories } from '../../services/categoriesAdminService.js';
import { listPeople } from '../../services/peopleService.js';
import { listClubs } from '../../services/clubsService.js';
import { deleteWinnerRecord, findWinnerFor, getWinnerRecord, saveWinnerRecord } from '../../services/winnersAdminService.js';
import { deleteImage } from '../../services/storageService.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { describeError } from '../../utils/errors.js';

const byName = (a, b) => a.label.localeCompare(b.label);

async function loadEditorData(id) {
  const [seasons, categories, people, teams, record] = await Promise.all([
    listSeasons(),
    listAllCategories(),
    listPeople(),
    listClubs(),
    id ? getWinnerRecord(id) : Promise.resolve(null),
  ]);
  return { seasons, categories, people, teams, record };
}

export default function WinnerEditPage() {
  const { id } = useParams();
  usePageTitle(id ? 'Admin · Edit winner' : 'Admin · Add winner');
  const state = useAsync(() => loadEditorData(id), [id]);

  let body;
  if (state.status === 'error') body = <ErrorState error={state.error} onRetry={state.reload} />;
  else if (!state.data) body = <Loader />;
  else if (id && !state.data.record)
    body = <EmptyState title="Winner record not found" message="It may have been deleted." action={<Link className="btn btn--primary" to="/admin/winners">Back to winners</Link>} />;
  else body = <WinnerEditor key={id ?? 'new'} data={state.data} />;

  return (
    <>
      <AdminPageHeader title={id ? 'Edit winner' : 'Add winner'} lead="Choose the season and category, then the winner. Check the preview before saving." />
      {body}
    </>
  );
}

function WinnerEditor({ data }) {
  const { seasons, categories, record } = data;
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive || c.id === record?.categoryId),
    [categories, record]
  );

  const [seasonId, setSeasonId] = useState(record?.seasonId ?? params.get('season') ?? seasons[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(record?.categoryId ?? '');
  const [personId, setPersonId] = useState(record?.personId ?? null);
  const [teamId, setTeamId] = useState(record?.teamId ?? null);
  const [photoPath, setPhotoPath] = useState(record?.photoPath ?? null);
  const [people, setPeople] = useState(data.people);
  const [teams, setTeams] = useState(data.teams);

  const [conflictId, setConflictId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const category = categories.find((c) => c.id === categoryId);
  const type = category?.winnerType; // 'player' | 'coach' | 'team'
  const isTeamAward = type === 'team';
  const person = people.find((p) => p.id === personId);
  const team = teams.find((t) => t.id === teamId);

  // Warn about an existing winner for the same season + category.
  useEffect(() => {
    if (!seasonId || !categoryId) {
      setConflictId(null);
      return undefined;
    }
    let cancelled = false;
    findWinnerFor(seasonId, categoryId)
      .then((found) => !cancelled && setConflictId(found && found !== record?.id ? found : null))
      .catch(() => !cancelled && setConflictId(null));
    return () => {
      cancelled = true;
    };
  }, [seasonId, categoryId, record]);

  function handleCategoryChange(nextId) {
    const next = categories.find((c) => c.id === nextId);
    setCategoryId(nextId);
    if (!next) return;
    const switchesTeamMeaning = (next.winnerType === 'team') !== isTeamAward;
    if (switchesTeamMeaning) setTeamId(null);
    if (next.winnerType === 'team') setPersonId(null);
    else if (person && person.role !== next.winnerType) setPersonId(null);
  }

  const upsertPerson = (p) => setPeople((list) => [...list.filter((x) => x.id !== p.id), p]);
  const upsertTeam = (t) => setTeams((list) => [...list.filter((x) => x.id !== t.id), t]);

  const personItems = useMemo(
    () =>
      people
        .filter((p) => p.role === type)
        .map((p) => ({ id: p.id, label: p.countryName ? `${p.fullName} (${p.countryName})` : p.fullName }))
        .sort(byName),
    [people, type]
  );
  const teamItems = useMemo(
    () => teams.map((t) => ({ id: t.id, label: t.kind === 'national_team' ? `${t.name} (national team)` : t.name })).sort(byName),
    [teams]
  );

  const country = person?.countryCode ? { code: person.countryCode, name: person.countryName } : team?.countryCode ? { code: team.countryCode, name: team.countryName } : null;

  const preview = {
    id: 'preview',
    categoryName: category?.name ?? '',
    winnerType: type ?? 'player',
    name: (isTeamAward ? team?.name : person?.fullName) || 'Winner name',
    photoUrl: getImageUrl(photoPath ?? (isTeamAward ? null : person?.photoPath)),
    teamName: team?.name ?? null,
    teamLogoUrl: getImageUrl(team?.logoPath),
    countryName: country?.name ?? null,
    countryIso: country?.code ?? null,
  };

  function validate() {
    if (!seasonId) return 'Please choose a season.';
    if (!categoryId) return 'Please choose an award category.';
    if (conflictId) return 'A winner already exists for this season and category. Edit that record instead.';
    if (isTeamAward) {
      if (!teamId) return 'Please choose the winning team.';
    } else {
      if (!personId) return `Please choose the ${type}.`;
      if (!teamId) return 'Please choose the club or team they represented.';
    }
    return '';
  }

  async function handleSave(status) {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveWinnerRecord({
        id: record?.id,
        seasonId,
        categoryId,
        personId: isTeamAward ? null : personId,
        teamId,
        photoPath,
        status,
      });
      if (record?.photoPath && record.photoPath !== photoPath) deleteImage(record.photoPath).catch(() => {});
      toast.success(status === 'published' ? 'Winner saved and published.' : 'Winner saved as a draft.');
      navigate(`/admin/winners?season=${seasonId}`);
    } catch (err) {
      setError(err.code === '23505' ? 'A winner already exists for this season and category.' : describeError(err));
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteWinnerRecord(record.id);
      if (record.photoPath) deleteImage(record.photoPath).catch(() => {});
      toast.success('Winner record deleted.');
      navigate('/admin/winners');
    } catch (err) {
      toast.error(describeError(err));
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const isPublished = record?.status === 'published';

  return (
    <div className="winner-editor">
      <div className="admin-card admin-form">
        <Field label="Season" htmlFor="w-season">
          <select id="w-season" value={seasonId} onChange={(e) => setSeasonId(e.target.value)} disabled={saving}>
            <option value="">Choose a season…</option>
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>

        <Field label="Award category" htmlFor="w-category">
          <select id="w-category" value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)} disabled={saving}>
            <option value="">Choose a category…</option>
            {activeCategories.map((c) => <option key={c.id} value={c.id}>{c.shortName}</option>)}
          </select>
        </Field>

        {conflictId && (
          <p className="form-error" role="alert">
            A winner already exists for this season and category. <Link to={`/admin/winners/${conflictId}`}>Edit that record</Link> instead.
          </p>
        )}

        {!category ? (
          <p className="field__hint">Choose a category to continue.</p>
        ) : (
          <>
            {!isTeamAward && (
              <EntityPicker
                id="w-person"
                label={type === 'coach' ? 'Coach' : 'Player'}
                noun={type}
                items={personItems}
                value={personId}
                onChange={setPersonId}
                disabled={saving}
                renderForm={({ mode, onDone, onCancel }) => (
                  <PersonForm
                    person={mode === 'edit' ? person : null}
                    fixedRole={type}
                    onSaved={(p) => { upsertPerson(p); onDone(p); }}
                    onCancel={onCancel}
                  />
                )}
              />
            )}

            <EntityPicker
              id="w-team"
              label={isTeamAward ? 'Winning team' : 'Club or team (that season)'}
              noun="club or team"
              items={teamItems}
              value={teamId}
              onChange={setTeamId}
              disabled={saving}
              renderForm={({ mode, onDone, onCancel }) => (
                <ClubForm
                  club={mode === 'edit' ? team : null}
                  onSaved={(t) => { upsertTeam(t); onDone(t); }}
                  onCancel={onCancel}
                />
              )}
            />

            {country && (
              <p className="field__hint">
                Country: <Flag iso={country.code} name={country.name} /> {country.name} (from the {person?.countryCode ? 'player’s' : 'team’s'} profile; use Edit to change it)
              </p>
            )}

            <ImageUpload
              label={isTeamAward ? 'Team image (optional)' : 'Photograph for this season (optional)'}
              value={photoPath}
              onChange={setPhotoPath}
              folder={isTeamAward ? 'clubs' : 'people'}
              disabled={saving}
              hint={isTeamAward ? 'Upload a separate team image here; the club logo is uploaded in the team details above.' : 'If empty, the person’s profile photograph is used.'}
            />
          </>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="admin-form__actions">
          {isPublished ? (
            <>
              <button type="button" className="btn btn--primary" onClick={() => handleSave('published')} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              <button type="button" className="btn btn--outline" onClick={() => handleSave('draft')} disabled={saving}>Unpublish and save</button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--primary" onClick={() => handleSave('published')} disabled={saving}>{saving ? 'Saving…' : 'Save and publish'}</button>
              <button type="button" className="btn btn--outline" onClick={() => handleSave('draft')} disabled={saving}>Save as draft</button>
            </>
          )}
          <Link className="btn btn--outline" to="/admin/winners">Cancel</Link>
          {record && (
            <button type="button" className="btn btn--danger-outline" onClick={() => setConfirmDelete(true)} disabled={saving}>Delete</button>
          )}
        </div>
      </div>

      <aside className="winner-editor__preview" aria-label="Preview">
        <p className="winner-editor__preview-label">Preview of the public card</p>
        <WinnerCard winner={preview} />
        <p className="field__hint">{isPublished ? 'Currently published.' : 'Not visible on the website until published.'}</p>
      </aside>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this winner record?"
        message="The record will be permanently deleted. The person and club are kept."
        confirmLabel="Delete winner"
        danger
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
