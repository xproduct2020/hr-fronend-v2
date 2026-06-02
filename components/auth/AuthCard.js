export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <>
      <article className="auth-card">
        <h2 className="auth-card__title">{title}</h2>
        <p className="auth-card__subtitle">{subtitle}</p>
        {children}
      </article>
      {footer}
    </>
  );
}
