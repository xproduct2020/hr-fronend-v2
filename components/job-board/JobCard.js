'use client';

import Link from 'next/link';
import {
  LOGO_STYLES,
  companyInitials,
  formatJobType,
  formatRelative,
  inferWorkMode,
} from '../../lib/job-board-utils';

export default function JobCard({ job, index = 0, token, onSignIn }) {
  const logoStyle = LOGO_STYLES[index % LOGO_STYLES.length];
  const work = inferWorkMode(job.location);
  const isFeatured = index === 0;

  function handleSignIn(e) {
    e.preventDefault();
    e.stopPropagation();
    onSignIn?.(e);
  }

  return (
    <Link href={`/jobs/${job.id}`} className={`job-card${isFeatured ? ' featured' : ''}`}>
      {isFeatured && <span className="featured-badge">Featured</span>}
      <div className="card-top">
        <div className="company-logo" style={logoStyle}>
          {companyInitials(job.company_name)}
        </div>
        <div className="card-info">
          <h3 className="job-title">{job.title}</h3>
          <p className="company-name">
            {job.company_name}
            {job.location ? ` · ${job.location}` : ''}
          </p>
        </div>
      </div>
      <div className="card-tags">
        <span className="tag tag-type">{formatJobType(job.job_type)}</span>
        <span className="tag tag-loc">
          <i
            className={`ti ti-${work === 'Remote' ? 'world' : 'map-pin'}`}
            style={{ fontSize: 11 }}
            aria-hidden="true"
          />
          {work}
        </span>
        {job.industry && <span className="tag tag-exp">{job.industry}</span>}
      </div>
      <div className="card-bottom">
        {token ? (
          job.salary_range ? (
            <div className="salary">{job.salary_range}</div>
          ) : (
            <div className="salary salary--muted">Salary not disclosed</div>
          )
        ) : (
          <button type="button" className="salary-gate" onClick={handleSignIn}>
            Sign in to see salary
          </button>
        )}
        <div className="card-meta">
          <span className="meta-item">
            <i className="ti ti-clock" style={{ fontSize: 13 }} aria-hidden="true" />
            {formatRelative(job.created_at)}
          </span>
        </div>
        <span className="apply-btn">Apply now</span>
      </div>
    </Link>
  );
}
