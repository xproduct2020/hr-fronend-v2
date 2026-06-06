import Link from 'next/link';
import './job-seeker-dashboard.css';

export default function JobSeekerDashboardShell({ children }) {
  return (
    <div className="js-dash">
      <header className="js-dash__topbar">
        <div className="js-dash__topbar-inner">
          <Link href="/" className="js-dash__logo">
            work<span>Scout</span>
          </Link>
          <Link href="/" className="js-dash__topbar-link">
            Browse jobs
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
