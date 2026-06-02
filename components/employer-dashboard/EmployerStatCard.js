export default function EmployerStatCard({ label, value, hint, icon }) {
  return (
    <article className="employer-stat-card">
      <div className="employer-stat-card__top">
        <p className="employer-stat-card__label">{label}</p>
        <i className={`ti ${icon} employer-stat-card__icon`} aria-hidden="true" />
      </div>
      <p className="employer-stat-card__value">{value}</p>
      <p className="employer-stat-card__hint">{hint}</p>
    </article>
  );
}
