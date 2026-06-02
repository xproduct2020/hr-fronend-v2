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
