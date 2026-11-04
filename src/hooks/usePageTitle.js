import { useEffect } from 'react';
import { SITE_NAME } from '../constants/config.js';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
