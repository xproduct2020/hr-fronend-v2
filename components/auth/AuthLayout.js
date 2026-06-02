import Link from 'next/link';
import './auth.css';

export default function AuthLayout({ children, roleLinks = [] }) {
  return (
    <div className="auth-page">
      <Link href="/" className="auth-page__brand">
        work<span>Scout</span>
      </Link>
      {children}
      {roleLinks.length > 0 && (
        <nav className="auth-role-nav" aria-label="Account type">
          {roleLinks.map((link) => (
            <Link key={link.href} href={link.href} className={link.active ? 'active' : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
