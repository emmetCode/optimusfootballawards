import { supabase } from '../lib/supabaseClient.js';
import { STORAGE_BUCKET } from '../constants/config.js';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const RASTER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg' };

// Returns an error message, or null if the file is acceptable.
export function validateImage(file, { allowSvg = false } = {}) {
  const allowed = allowSvg ? [...RASTER_TYPES, 'image/svg+xml'] : RASTER_TYPES;
  if (!allowed.includes(file.type)) return `Please choose a ${allowSvg ? 'JPG, PNG, WebP or SVG' : 'JPG, PNG or WebP'} image.`;
  if (file.size > MAX_IMAGE_BYTES) return 'That image is larger than 5 MB. Please choose a smaller one.';
  return null;
}

// Every upload gets a unique name, so replacing a photo never serves a stale cached copy.
export async function uploadImage(file, folder) {
  const path = `${folder}/${crypto.randomUUID()}.${EXTENSIONS[file.type] ?? 'jpg'}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

// Fixed-name upload (used for the hero photograph). Short cache so a replacement shows up quickly.
export async function uploadImageAt(file, path) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: '60', upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function deleteImage(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) throw error;
}

export async function listImages(folder) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(folder, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) throw error;
  return data
    .filter((item) => item.id && !item.name.startsWith('.'))
    .map((item) => ({
      path: `${folder}/${item.name}`,
      name: item.name,
      size: item.metadata?.size ?? null,
      createdAt: item.created_at ?? null,
    }));
}
