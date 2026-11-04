import { useRef, useState } from 'react';
import { deleteImage, uploadImage, validateImage } from '../../services/storageService.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { describeError } from '../../utils/errors.js';

// Uploads straight to Supabase Storage and reports the saved path through onChange.
// Files uploaded during this editing session and then replaced/removed are cleaned up automatically.
export default function ImageUpload({ label, value, onChange, folder, allowSvg = false, hint, shape = 'portrait', disabled = false }) {
  const inputRef = useRef(null);
  const sessionUploads = useRef(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const url = getImageUrl(value);
  const accept = allowSvg ? 'image/jpeg,image/png,image/webp,image/svg+xml' : 'image/jpeg,image/png,image/webp';

  function discardIfSessionUpload(path) {
    if (path && sessionUploads.current.has(path)) {
      sessionUploads.current.delete(path);
      deleteImage(path).catch(() => {});
    }
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    const problem = validateImage(file, { allowSvg });
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    try {
      const path = await uploadImage(file, folder);
      sessionUploads.current.add(path);
      const previous = value;
      onChange(path);
      discardIfSessionUpload(previous);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  function handleRemove() {
    const previous = value;
    onChange(null);
    discardIfSessionUpload(previous);
  }

  return (
    <div className="image-upload">
      <span className="image-upload__label">{label}</span>
      <div className="image-upload__row">
        <div className={`image-upload__preview image-upload__preview--${shape}`}>
          {url ? <img src={url} alt="" /> : <span>No image</span>}
        </div>
        <div className="image-upload__actions">
          <input ref={inputRef} type="file" accept={accept} onChange={handleFile} hidden />
          <button type="button" className="btn btn--outline btn--small" onClick={() => inputRef.current?.click()} disabled={busy || disabled}>
            {busy ? 'Uploading…' : url ? 'Replace image' : 'Upload image'}
          </button>
          {url && !busy && (
            <button type="button" className="btn btn--outline btn--small" onClick={handleRemove} disabled={disabled}>
              Remove
            </button>
          )}
          {hint && <p className="field__hint">{hint}</p>}
          {error && <p className="field__error" role="alert">{error}</p>}
        </div>
      </div>
    </div>
  );
}
