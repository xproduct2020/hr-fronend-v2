'use client';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getResumeUrl(applicant) {
  return applicant.resume_url || applicant.profile_resume_url || null;
}

export default function EmployerApplicantCard({ applicant, jobId, onStatusChange }) {
  const resumeUrl = getResumeUrl(applicant);
  const phone = applicant.application_phone || applicant.job_seeker_phone;

  return (
    <article className="employer-applicant-card">
      <div className="employer-applicant-card__header">
        <div className="employer-applicant-card__avatar" aria-hidden="true">
          {(applicant.full_name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="employer-applicant-card__info">
          <h3 className="employer-applicant-card__name">{applicant.full_name}</h3>
          <p className="employer-applicant-card__email">{applicant.email}</p>
          {phone && (
            <p className="employer-applicant-card__meta">
              <i className="ti ti-phone" aria-hidden="true" />
              {phone}
            </p>
          )}
          {applicant.headline && (
            <p className="employer-applicant-card__headline">{applicant.headline}</p>
          )}
        </div>
        <select
          className="employer-applicant-card__status"
          value={applicant.application_status}
          onChange={(e) => onStatusChange(jobId, applicant.application_id, e.target.value)}
          aria-label={`Status for ${applicant.full_name}`}
        >
          {['pending', 'reviewed', 'accepted', 'rejected'].map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="employer-applicant-card__details">
        {applicant.skills && (
          <p>
            <strong>Skills:</strong> {applicant.skills}
          </p>
        )}
        {applicant.years_experience != null && (
          <p>
            <strong>Experience:</strong> {applicant.years_experience} years
          </p>
        )}
        {applicant.cover_letter && (
          <p className="employer-applicant-card__cover">
            <strong>Cover letter:</strong> {applicant.cover_letter}
          </p>
        )}
        {applicant.summary && (
          <p className="employer-applicant-card__cover">
            <strong>Summary:</strong> {applicant.summary}
          </p>
        )}
      </div>

      <div className="employer-applicant-card__footer">
        <span className="employer-applicant-card__date">
          <i className="ti ti-clock" aria-hidden="true" />
          Applied {formatDate(applicant.applied_at)}
        </span>
        {resumeUrl ? (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="employer-applicant-card__cv-btn"
          >
            <i className="ti ti-file-text" aria-hidden="true" />
            View CV
          </a>
        ) : (
          <span className="employer-applicant-card__no-cv">No CV attached</span>
        )}
      </div>
    </article>
  );
}
