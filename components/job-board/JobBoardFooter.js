'use client';

import Link from 'next/link';

export default function JobBoardFooter({ onSignInClick }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              work<span>Scout</span>
            </div>
            <p className="footer-desc">
              Helping great people find great companies. Browse open roles and track your applications in one place.
            </p>
          </div>
          <div className="footer-col">
            <h4>For job seekers</h4>
            <a href="#jobs">Browse Jobs</a>
            <button
              type="button"
              className="clear-link"
              style={{ display: 'block', marginBottom: 8 }}
              onClick={onSignInClick}
            >
              Sign in for salaries
            </button>
            <Link href="/dashboard">My applications</Link>
          </div>
          <div className="footer-col">
            <h4>For employers</h4>
            <Link href="/employer">Post a Job</Link>
            <Link href="/employer/dashboard">Employer dashboard</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} workScout. All rights reserved.</span>
          <div className="footer-socials">
            <div className="social">
              <i className="ti ti-brand-twitter" aria-hidden="true" />
            </div>
            <div className="social">
              <i className="ti ti-brand-linkedin" aria-hidden="true" />
            </div>
            <div className="social">
              <i className="ti ti-brand-github" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
