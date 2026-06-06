import Link from 'next/link';

export default function EmployerDashboardFooter() {
  return (
    <footer className="employer-dash__footer">
      <div className="employer-dash__footer-inner">
        <div className="employer-dash__footer-grid">
          <div>
            <div className="employer-dash__footer-brand">
              work<span>Scout</span>
            </div>
            <p className="employer-dash__footer-desc">
              Helping great people find great companies. Post jobs and manage applications in one place.
            </p>
          </div>
          <div className="employer-dash__footer-col">
            <h4>Quick Links</h4>
            <Link href="/">Browse Jobs</Link>
            <Link href="/employer/dashboard">Employer Dashboard</Link>
            <Link href="/employer/job-post">Post a Job</Link>
            <Link href="/employer/company">Company Settings</Link>
          </div>
          <div className="employer-dash__footer-col">
            <h4>Support</h4>
            <a href="#help">Help Center</a>
            <a href="#contact">Contact Us</a>
            <a href="#privacy">Privacy Policy</a>
          </div>
        </div>
        <div className="employer-dash__footer-bottom">
          <span>© {new Date().getFullYear()} workScout. All rights reserved.</span>
          <div className="employer-dash__footer-socials">
            <span className="employer-dash__social">
              <i className="ti ti-brand-twitter" aria-hidden="true" />
            </span>
            <span className="employer-dash__social">
              <i className="ti ti-brand-linkedin" aria-hidden="true" />
            </span>
            <span className="employer-dash__social">
              <i className="ti ti-brand-github" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
