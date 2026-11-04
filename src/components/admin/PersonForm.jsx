import { useState } from 'react';
import Field from '../ui/Field.jsx';
import CountrySelect from './CountrySelect.jsx';
import ImageUpload from './ImageUpload.jsx';
import { savePerson } from '../../services/peopleService.js';
import { deleteImage } from '../../services/storageService.js';
import { describeError } from '../../utils/errors.js';
import { useToast } from '../../hooks/useToast.js';

// Deliberately not a <form> element: it can be embedded inside the winner editor.
export default function PersonForm({ person, fixedRole, onSaved, onCancel }) {
  const toast = useToast();
  const [fullName, setFullName] = useState(person?.fullName ?? '');
  const [role, setRole] = useState(person?.role ?? fixedRole ?? 'player');
  const [countryCode, setCountryCode] = useState(person?.countryCode ?? null);
  const [photoPath, setPhotoPath] = useState(person?.photoPath ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!fullName.trim()) {
      setError('Please enter a name.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = await savePerson({ id: person?.id, fullName, role: fixedRole ?? role, countryCode, photoPath });
      if (person?.photoPath && person.photoPath !== photoPath) deleteImage(person.photoPath).catch(() => {});
      toast.success(person ? 'Changes saved.' : `${saved.fullName} added.`);
      onSaved(saved);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-form">
      <Field label="Full name" htmlFor="person-name">
        <input id="person-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={saving} />
      </Field>
      {!fixedRole && (
        <Field label="Role" htmlFor="person-role">
          <select id="person-role" value={role} onChange={(e) => setRole(e.target.value)} disabled={saving}>
            <option value="player">Player</option>
            <option value="coach">Coach</option>
          </select>
        </Field>
      )}
      <Field label="Country" htmlFor="person-country" hint="Shown as a flag on the winner card.">
        <CountrySelect id="person-country" value={countryCode} onChange={setCountryCode} disabled={saving} />
      </Field>
      <ImageUpload label="Photograph" value={photoPath} onChange={setPhotoPath} folder="people" disabled={saving} hint="JPG, PNG or WebP, up to 5 MB. Portrait works best." />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="admin-form__actions">
        <button type="button" className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : person ? 'Save changes' : `Add ${fixedRole ?? role}`}
        </button>
        <button type="button" className="btn btn--outline" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}
