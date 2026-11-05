const CATEGORY_NAME_OVERRIDES = {
  striker: {
    name: 'The Optimus Forward of the Season',
    shortName: 'Forward',
  },
  'central-midfielder': {
    name: 'The Optimus Midfield Maestro of the Season',
    shortName: 'Midfield Maestro',
  },
};

export function getAwardCategoryName(slug, fallback) {
  return CATEGORY_NAME_OVERRIDES[slug]?.name ?? fallback;
}

export function getAwardCategoryShortName(slug, fallback) {
  return CATEGORY_NAME_OVERRIDES[slug]?.shortName ?? fallback;
}
