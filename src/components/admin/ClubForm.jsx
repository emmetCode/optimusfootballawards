import { useState } from 'react';
import Field from '../ui/Field.jsx';
import CountrySelect from './CountrySelect.jsx';
import ImageUpload from './ImageUpload.jsx';
import { saveClub } from '../../services/clubsService.js';
import { deleteImage } from '../../services/storageService.js';
import { describeError } from '../../utils/errors.js';
import { useToast } from '../../hooks/useToast.js';

// Not a <form> element, so it can be embedded inside the winner editor.
export default function ClubForm({ club, onSaved, onCancel }) {
  const toast = useToast();
  const [name, setName] = useState(club?.name ?? '');
  const [kind, setKind] = useState(club?.kind ?? 'club');
  const [countryCode, setCountryCode] = useState(club?.countryCode ?? null);
  const [logoPath, setLogoPath] = useState(club?.logoPath ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    if (kind === 'national_team' && !countryCode) {
      setError('Please choose the country for a national team.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await saveClub({ id: club?.id, name, kind, countryCode, logoPath });
      if (club?.logoPath && club.logoPath !== logoPath) deleteImage(club.logoPath).catch(() => {});
      toast.success(club ? 'Changes saved.' : `${saved.name} added.`);
      onSaved(saved);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-form">
      <Field label="Name" htmlFor="club-name">
        <input id="club-name" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
      </Field>
      <Field label="Type" htmlFor="club-kind">
        <select id="club-kind" value={kind} onChange={(e) => setKind(e.target.value)} disabled={saving}>
          <option value="club">Club</option>
          <option value="national_team">National team</option>
        </select>
      </Field>
      <Field label="Country" htmlFor="club-country" hint="Used for the flag on the card.">
        <CountrySelect id="club-country" value={countryCode} onChange={setCountryCode} disabled={saving} />
      </Field>
      <ImageUpload
        label="Club logo (optional)"
        value={logoPath}
        onChange={setLogoPath}
        folder="clubs"
        allowSvg
        shape="square"
        disabled={saving}
        hint="Without a logo, a simple badge with the club’s initials is shown."
      />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="admin-form__actions">
        <button type="button" className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : club ? 'Save changes' : 'Add club or team'}
        </button>
        <button type="button" className="btn btn--outline" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}
