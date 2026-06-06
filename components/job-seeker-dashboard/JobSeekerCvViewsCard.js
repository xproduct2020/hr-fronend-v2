export default function JobSeekerCvViewsCard({ cvViews }) {
  return (
    <section className="js-dash__card js-dash__cv-views">
      <span className="js-dash__new-badge">NEW</span>
      <div className="js-dash__cv-views-count">
        <strong>{cvViews}</strong>
        <span>views</span>
      </div>
      <div className="js-dash__cv-views-text">
        <h3>CV Views by Recruiters</h3>
        <p>Your anonymous CV was viewed by recruiters while searching for candidates.</p>
      </div>
    </section>
  );
}
