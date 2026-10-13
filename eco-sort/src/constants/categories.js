
export const PRODUCT_CATEGORIES = [
  { id: 'recyclable', label: 'Recyclable' },
  { id: 'organic', label: 'Organic' },
  { id: 'ewaste', label: 'Electronic Waste' },
  { id: 'unknown', label: 'Unknown or Low Confidence' },
];

export const CATEGORY_LABEL = Object.fromEntries(
  PRODUCT_CATEGORIES.map((c) => [c.id, c.label])
);

export const PRIMARY_CATEGORY_IDS = PRODUCT_CATEGORIES.map((c) => c.id);

export const LABEL_TO_CATEGORY = {
  'Recyclable Waste': 'recyclable',
  'E-Waste': 'ewaste',
  'Organic Waste': 'organic',
};

export const MODEL_LABELS = Object.keys(LABEL_TO_CATEGORY);

export const MODEL_URL = '/model/';

export const CONFIDENCE_THRESHOLD = 0.55;

export function toApplicationCategory(raw) {
  if (!raw) return 'unknown';
  if (PRIMARY_CATEGORY_IDS.includes(raw)) return raw;

  const legacyMap = {
    plastic: 'recyclable',
    paper: 'recyclable',
    metal: 'recyclable',
    glass: 'recyclable',
    organic: 'organic',
    ewaste: 'ewaste',
    hazardous: 'unknown',
    textiles: 'unknown',
    residual: 'unknown',
    unknown: 'unknown',
  };

  return legacyMap[raw] || 'unknown';
}

export const DISPOSAL_STREAM = {
  recyclable: { label: 'Potentially recyclable', tone: 'recyclable' },
  organic: { label: 'Organic / compostable', tone: 'organic' },
  ewaste: { label: 'Electronic waste', tone: 'ewaste' },
  unknown: { label: 'Unknown / verify locally', tone: 'unknown' },
};
