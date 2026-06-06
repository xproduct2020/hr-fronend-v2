export const LOGO_STYLES = [
  { background: '#eff6ff', color: '#1d4ed8' },
  { background: '#f0fdf4', color: '#166534' },
  { background: '#fdf4ff', color: '#7e22ce' },
  { background: '#fff7ed', color: '#c2410c' },
  { background: '#fef2f2', color: '#b91c1c' },
];

export const JOB_TYPES = ['', 'full-time', 'part-time', 'contract', 'internship', 'freelance'];
export const WORK_MODES = ['Any mode', 'Remote', 'Hybrid', 'On-site'];

export function companyInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function formatJobType(type) {
  if (!type) return 'Full-time';
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

export function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export function formatPostedLabel(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted 1 day ago';
  return `Posted ${days} days ago`;
}

const DAY_FULL = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

export function formatWorkingDays(days) {
  if (!days?.length) return '';
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  if (weekdays.every((d) => days.includes(d)) && days.length === 5) {
    return 'Monday - Friday';
  }
  return days.map((d) => DAY_FULL[d] || d).join(', ');
}

const COUNTRY_FLAGS = {
  'United States': '🇺🇸',
  Vietnam: '🇻🇳',
  'United Kingdom': '🇬🇧',
  Singapore: '🇸🇬',
  Japan: '🇯🇵',
  Australia: '🇦🇺',
  Germany: '🇩🇪',
};

export function countryFlag(country) {
  return COUNTRY_FLAGS[country] || '🌐';
}

export function formatWorkModeLabel(location) {
  const mode = inferWorkMode(location);
  if (mode === 'Remote') return 'Remote';
  if (mode === 'Hybrid') return 'Hybrid';
  return 'At office';
}

export function formatLocationLine(loc) {
  return [loc.label, loc.address, loc.country].filter(Boolean).join(', ');
}

export function extractJobSkills(job, company) {
  if (job.skills) {
    const raw = typeof job.skills === 'string' ? job.skills.split(/[,;|]/) : job.skills;
    return raw.map((s) => s.trim()).filter(Boolean);
  }

  const match = job.description?.match(/skills?:\s*(.+)/i);
  if (match) {
    return match[1]
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const tags = [];
  if (job.title) {
    const cleaned = job.title.replace(/\([^)]*\)/g, '').trim();
    if (cleaned) tags.push(cleaned);
  }
  if (company?.industry) tags.push(company.industry);
  return [...new Set(tags)].slice(0, 4);
}

export const OFFICE_GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=480&h=320&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=480&h=320&fit=crop',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=480&h=320&fit=crop',
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e7c?w=480&h=320&fit=crop',
  'https://images.unsplash.com/photo-1577412647305-991150ad7d08?w=480&h=320&fit=crop',
];

export function inferWorkMode(location) {
  if (!location) return 'On-site';
  const loc = location.toLowerCase();
  if (loc.includes('remote')) return 'Remote';
  if (loc.includes('hybrid')) return 'Hybrid';
  return 'On-site';
}

export function matchesWorkMode(job, mode) {
  if (!mode || mode === 'Any mode') return true;
  return inferWorkMode(job.location) === mode;
}

export function matchesIndustry(job, dept) {
  if (!dept) return true;
  return (job.industry || '').toLowerCase().includes(dept.toLowerCase());
}
