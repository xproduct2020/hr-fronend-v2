'use client';

export default function JobBoardHero({
  total,
  search,
  locationFilter,
  onSearchChange,
  onLocationChange,
  onSubmit,
}) {
  return (
    <section className="hero">
      <div className="hero-tag">
        <i className="ti ti-flame" style={{ fontSize: 13 }} aria-hidden="true" />
        {total > 0 ? `${total.toLocaleString()}+ open roles` : 'New jobs added daily'}
      </div>
      <h1>
        Find your next
        <br />
        <em>great opportunity</em>
      </h1>
      <p>Connecting talent with companies that are building the future.</p>
      <form className="search-box" onSubmit={onSubmit}>
        <i className="ti ti-search" style={{ fontSize: 18, color: '#94a3b8' }} aria-hidden="true" />
        <input
          type="text"
          placeholder="Job title, skill, or company…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="sdiv" />
        <select
          value={locationFilter}
          onChange={(e) => onLocationChange(e.target.value)}
          aria-label="Location"
        >
          <option value="">All locations</option>
          <option value="Remote">Remote</option>
          <option value="Ho Chi Minh City">Ho Chi Minh City</option>
          <option value="Hanoi">Hanoi</option>
          <option value="Singapore">Singapore</option>
        </select>
        <button type="submit" className="search-btn">
          Search Jobs
        </button>
      </form>
      <div className="hero-stats">
        <span>
          <b>{total > 0 ? total.toLocaleString() : '—'}</b> jobs live
        </span>
        <span>
          <b>—</b> companies
        </span>
        <span>
          <b>—</b> candidates
        </span>
      </div>
    </section>
  );
}
