'use client';

import Link from 'next/link';

export default function JobBoardHeader({ token, onAccountClick }) {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          work<span>Scout</span>
        </Link>
        <nav className="nav">
          <a href="#jobs">Browse Jobs</a>
          <Link href="/employer" className="nav-hide-mobile">
            For Employers
          </Link>
          <Link href="/admin" className="nav-hide-mobile">
            Admin
          </Link>
          <Link href="/employer" className="nav-btn">
            Post a Job
          </Link>
          {token ? (
            <Link href="/dashboard" className="account-btn">
              <i className="ti ti-user" aria-hidden="true" />
              Account
            </Link>
          ) : (
            <button type="button" className="account-btn" onClick={onAccountClick}>
              <i className="ti ti-user" aria-hidden="true" />
              Account
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
