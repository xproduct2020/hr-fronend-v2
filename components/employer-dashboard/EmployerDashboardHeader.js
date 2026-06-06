'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployerDashboardHeader({
  pageTitle = 'Employer Dashboard',
  pageSubtitle = 'Manage your job postings and applications',
  companyName,
  userName,
  userEmail,
  onPostJob,
  onSettings,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function logout() {
    localStorage.removeItem('token');
    router.push('/employer/login');
  }

  function goToSettings() {
    setOpen(false);
    if (onSettings) onSettings();
    else router.push('/employer/company');
  }

  const displayName = userName || companyName || 'Account';

  return (
    <header className="employer-dash__header">
      <div>
        <h1 className="employer-dash__title">{pageTitle}</h1>
        <p className="employer-dash__subtitle">{pageSubtitle}</p>
      </div>
      <div className="employer-dash__actions">
        <button type="button" className="employer-dash__btn-primary" onClick={onPostJob}>
          <i className="ti ti-plus" aria-hidden="true" />
          Post Job
        </button>
        <div className="employer-dash__account-wrap" ref={wrapRef}>
          <button
            type="button"
            className={`employer-dash__account-btn${open ? ' employer-dash__account-btn--open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="true"
          >
            <i className="ti ti-user" aria-hidden="true" />
            Account
          </button>
          {open && (
            <div className="employer-dash__dropdown" role="menu">
              <div className="employer-dash__dropdown-user">
                <p className="employer-dash__dropdown-name">{displayName}</p>
                {userEmail ? <p className="employer-dash__dropdown-email">{userEmail}</p> : null}
              </div>
              <button type="button" className="employer-dash__dropdown-item" role="menuitem" onClick={goToSettings}>
                <i className="ti ti-settings" aria-hidden="true" />
                Company Settings
              </button>
              <button
                type="button"
                className="employer-dash__dropdown-item employer-dash__dropdown-item--danger"
                role="menuitem"
                onClick={logout}
              >
                <i className="ti ti-logout" aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
