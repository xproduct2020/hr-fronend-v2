'use client';

import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard', href: '/dashboard' },
  { id: 'cv', label: 'CV Attachment', icon: 'ti-paperclip', href: '/dashboard#cv' },
  { id: 'profile', label: 'workScout Profile', icon: 'ti-user-circle', href: '/dashboard#profile' },
  { id: 'jobs', label: 'My Jobs', icon: 'ti-briefcase', href: '/dashboard#activities' },
  { id: 'invitations', label: 'Job Invitation', icon: 'ti-mail', href: '/dashboard#activities', badgeKey: 'jobInvitations' },
  { id: 'email', label: 'Email Subscriptions', icon: 'ti-mail-forward', href: '/dashboard' },
  { id: 'notifications', label: 'Notifications', icon: 'ti-bell', href: '/dashboard' },
  { id: 'settings', label: 'Settings', icon: 'ti-settings', href: '/dashboard' },
];

export default function JobSeekerSidebar({
  fullName,
  cvVisible,
  cvViews,
  stats,
  activeId = 'dashboard',
  onToggleCvVisible,
}) {
  const router = useRouter();

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  return (
    <aside className="js-dash__sidebar">
      <div className="js-dash__welcome">
        <p className="js-dash__welcome-label">👋 Welcome</p>
        <p className="js-dash__welcome-name">{fullName || 'Job seeker'}</p>

        <div className="js-dash__toggle-row">
          <span>Make Your CV Visible</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label className="js-dash__toggle">
              <input
                type="checkbox"
                checked={cvVisible}
                onChange={(e) => onToggleCvVisible(e.target.checked)}
              />
              <span className="js-dash__toggle-track" />
            </label>
            {cvVisible && <span className="js-dash__toggle-label">On</span>}
          </div>
        </div>

        <div className="js-dash__toggle-row" style={{ borderBottom: 'none' }}>
          <span>CV Views by Recruiters</span>
          <span className="js-dash__badge">{cvViews}</span>
        </div>
      </div>

      <ul className="js-dash__nav">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <a href={item.href} className={item.id === activeId ? 'active' : ''}>
              <i className={`ti ${item.icon}`} aria-hidden="true" />
              {item.label}
              {item.badgeKey && stats?.[item.badgeKey] != null && (
                <span className="js-dash__nav-badge">{stats[item.badgeKey]}</span>
              )}
            </a>
          </li>
        ))}
        <li>
          <button type="button" className="js-dash__nav-logout" onClick={logout}>
            <i className="ti ti-logout" aria-hidden="true" />
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
}
