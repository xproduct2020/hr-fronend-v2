'use client';

import JobCard from './JobCard';

export default function JobList({
  jobs,
  jobsLoading,
  total,
  sortBy,
  hasMore,
  token,
  onSortChange,
  onLoadMore,
  onSignIn,
}) {
  return (
    <div className="page" id="jobs">
      <div className="page-content">
        <div className="jobs-header">
          <div className="jobs-count">
            Open positions{' '}
            <span>
              {jobsLoading ? 'Loading…' : `${jobs.length} shown`}
              {total > jobs.length ? ` · ${total} total` : ''}
            </span>
          </div>
          <select className="sort-select" value={sortBy} onChange={(e) => onSortChange(e.target.value)} aria-label="Sort jobs">
            <option value="newest">Newest first</option>
            <option value="title">Job title (A–Z)</option>
          </select>
        </div>

        {jobsLoading && jobs.length === 0 ? (
          <p className="empty-state">Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <p className="empty-state">No open jobs match your filters.</p>
        ) : (
          jobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index} token={token} onSignIn={onSignIn} />
          ))
        )}

        {hasMore && !jobsLoading && (
          <button type="button" className="load-more" onClick={onLoadMore}>
            Load more jobs <i className="ti ti-arrow-down" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
