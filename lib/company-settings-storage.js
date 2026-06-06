const STORAGE_KEY = 'employer_company_settings';

export function createEmptyLocation() {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    label: '',
    address: '',
    country: '',
  };
}

export const DEFAULT_COMPANY_SETTINGS = {
  companyName: '',
  logoUrl: '',
  companyType: '',
  industry: '',
  companySize: '',
  country: '',
  workingDays: [],
  description: '',
  website: '',
  linkedin: '',
  facebook: '',
  locations: [createEmptyLocation()],
};

function normalizeSettings(raw) {
  const merged = { ...DEFAULT_COMPANY_SETTINGS, ...raw };

  // Migrate legacy single `location` string
  if (raw?.location && (!raw.locations || raw.locations.length === 0)) {
    merged.locations = [
      {
        id: createEmptyLocation().id,
        label: 'Main office',
        address: raw.location,
        country: raw.country || '',
      },
    ];
  }

  if (!Array.isArray(merged.locations) || merged.locations.length === 0) {
    merged.locations = [createEmptyLocation()];
  }

  merged.locations = merged.locations.map((loc) => ({
    id: loc.id || createEmptyLocation().id,
    label: loc.label || '',
    address: loc.address || '',
    country: loc.country || '',
  }));

  // Migrate legacy base64 field to logoUrl when no blob URL exists
  if (!merged.logoUrl && merged.logoDataUrl) {
    merged.logoUrl = merged.logoDataUrl.startsWith('http') ? merged.logoDataUrl : '';
  }
  delete merged.logoDataUrl;
  delete merged.location;
  return merged;
}

export function loadCompanySettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_COMPANY_SETTINGS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_COMPANY_SETTINGS };
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_COMPANY_SETTINGS };
  }
}

export function saveCompanySettings(settings) {
  const payload = normalizeSettings(settings);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
