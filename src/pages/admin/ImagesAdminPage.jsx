import { useRef, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../hooks/useToast.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { HERO_IMAGE_PATH } from '../../constants/config.js';
import { deleteImage, listImages, uploadImageAt, validateImage } from '../../services/storageService.js';
import { fetchUsedImagePaths } from '../../services/adminService.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { describeError } from '../../utils/errors.js';

const FOLDERS = [
  { id: 'people', label: 'Players and coaches' },
  { id: 'clubs', label: 'Clubs and teams' },
];

function formatSize(bytes) {
  if (bytes == null) return '';
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function HeroManager() {
  const toast = useToast();
  const inputRef = useRef(null);
  const [version, setVersion] = useState(() => Date.now());
  const [hasImage, setHasImage] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = validateImage(file);
    if (problem) return setError(problem);
    setBusy(true);
    setError('');
    try {
      await uploadImageAt(file, HERO_IMAGE_PATH);
      setVersion(Date.now());
      setHasImage(true);
      toast.success('Hero photograph updated. It can take a minute to appear on the website.');
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-card">
      <h2 className="admin-card__title">Home page hero photograph</h2>
      <div className="image-upload__row">
        <div className="image-upload__preview image-upload__preview--wide">
          {hasImage ? (
            <img src={`${getImageUrl(HERO_IMAGE_PATH)}?v=${version}`} alt="" onError={() => setHasImage(false)} />
          ) : (
            <span>No hero photograph yet</span>
          )}
        </div>
        <div className="image-upload__actions">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} hidden />
          <button type="button" className="btn btn--primary btn--small" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? 'Uploading…' : hasImage ? 'Replace photograph' : 'Upload photograph'}
          </button>
          <p className="field__hint">Use an award or trophy photograph (not a player photo). Portrait or square, JPG/PNG/WebP, up to 5 MB.</p>
          {error && <p className="field__error" role="alert">{error}</p>}
        </div>
      </div>
    </section>
  );
}

export default function ImagesAdminPage() {
  usePageTitle('Admin · Images');
  const toast = useToast();
  const [folder, setFolder] = useState('people');
  const files = useAsync(() => listImages(folder), [folder]);
  const used = useAsync(fetchUsedImagePaths, [folder]);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteImage(toDelete.path);
      toast.success('Image deleted.');
      files.reload();
    } catch (err) {
      toast.error(describeError(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <>
      <AdminPageHeader title="Images" lead="Manage uploaded image files. Photographs and logos are normally added from Players, Clubs and Winners." />
      <HeroManager />

      <section className="admin-card">
        <h2 className="admin-card__title">Image library</h2>
        <div className="admin-toolbar">
          <select className="toolbar-input" aria-label="Folder" value={folder} onChange={(e) => setFolder(e.target.value)}>
            {FOLDERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>

        {files.status === 'error' ? (
          <ErrorState error={files.error} onRetry={files.reload} />
        ) : !files.data || !used.data ? (
          used.status === 'error' ? <ErrorState error={used.error} onRetry={used.reload} /> : <Loader />
        ) : files.data.length === 0 ? (
          <EmptyState title="No images in this folder" message="Images you upload appear here." />
        ) : (
          <div className="image-grid">
            {files.data.map((file) => {
              const inUse = used.data.has(file.path);
              return (
                <figure key={file.path} className="image-grid__item">
                  <img src={getImageUrl(file.path)} alt="" loading="lazy" />
                  <figcaption>
                    <span className={`badge ${inUse ? 'badge--published' : 'badge--draft'}`}>{inUse ? 'In use' : 'Unused'}</span>
                    <span className="cell-sub">{formatSize(file.size)}</span>
                    <button type="button" className="link-button link-button--danger" onClick={() => setToDelete(file)} disabled={inUse} title={inUse ? 'Remove it from its record first' : 'Delete image'}>
                      Delete
                    </button>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this image?"
        message="The file will be permanently deleted from storage."
        confirmLabel="Delete image"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
