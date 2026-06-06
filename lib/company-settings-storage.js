const STORAGE_KEY = 'employer_company_settings';

export const DEFAULT_COMPANY_SETTINGS = {
  companyName: '',
  logoDataUrl: '',
  companyType: '',
  industry: '',
  companySize: '',
  country: '',
  workingDays: [],
  description: '',
  website: '',
  linkedin: '',
  facebook: '',
  location: '',
};

export function loadCompanySettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_COMPANY_SETTINGS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_COMPANY_SETTINGS };
    return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_COMPANY_SETTINGS };
  }
}

export function saveCompanySettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
