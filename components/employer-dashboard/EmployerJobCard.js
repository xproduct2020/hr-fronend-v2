'use client';

function formatPostedDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function EmployerJobCard({ job, onViewApplications, onEdit, onToggleStatus }) {
  const isOpen = job.status === 'open';

  return (
    <article className="employer-job-card">
      <div className="employer-job-card__top">
        <div>
          <h3 className="employer-job-card__title">{job.title}</h3>
          <p className="employer-job-card__date">Posted on {formatPostedDate(job.created_at)}</p>
        </div>
        <span className={`employer-job-card__badge employer-job-card__badge--${isOpen ? 'open' : 'closed'}`}>
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>
      <div className="employer-job-card__apps">
        <p className="employer-job-card__apps-label">Applications</p>
        <p className="employer-job-card__apps-value">{job.application_count ?? 0}</p>
      </div>
      <div className="employer-job-card__actions">
        <button type="button" className="employer-job-card__action" onClick={() => onViewApplications(job)}>
          View Applications
        </button>
        <button type="button" className="employer-job-card__action" onClick={() => onEdit(job)}>
          Edit
        </button>
        <button type="button" className="employer-job-card__action" onClick={() => onToggleStatus(job)}>
          {isOpen ? 'Close' : 'Reopen'}
        </button>
      </div>
    </article>
  );
}
