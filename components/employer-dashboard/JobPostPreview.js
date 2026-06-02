'use client';

import { formatJobType } from '../../lib/job-board-utils';

function parseDescription(description) {
  if (!description?.trim()) {
    return { about: '', bullets: [] };
  }
  const lines = description.split('\n');
  const bullets = lines
    .filter((line) => /^[\s]*[-*•]/.test(line))
    .map((line) => line.replace(/^[\s]*[-*•]\s*/, '').trim())
    .filter(Boolean);
  const about = lines
    .filter((line) => !/^[\s]*[-*•]/.test(line) && line.trim())
    .join('\n')
    .trim();
  return { about, bullets };
}

export default function JobPostPreview({ form, companyName }) {
  const { about, bullets } = parseDescription(form.description);
  const postedDate = new Date().toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="job-post-card job-preview">
      <h3 className="job-post-card__title">Live Preview</h3>

      <h2 className="job-preview__title">{form.title.trim() || 'Job Title'}</h2>
      <p className="job-preview__company">{companyName || 'Company Name'}</p>

      <div className="job-preview__tags">
        {form.location ? <span className="job-preview__tag">{form.location}</span> : null}
        <span className="job-preview__tag">{formatJobType(form.jobType)}</span>
        {form.salaryRange ? <span className="job-preview__tag">{form.salaryRange}</span> : null}
        <span className={`job-preview__tag${form.status === 'open' ? '' : ''}`}>
          {form.status === 'open' ? 'Accepting applications' : 'Closed'}
        </span>
      </div>

      <button type="button" className="job-preview__apply" tabIndex={-1}>
        Apply Now
      </button>

      <div className="job-preview__section">
        <h4>About the Role</h4>
        {about ? (
          <p>{about}</p>
        ) : form.description.trim() && !about && bullets.length === 0 ? (
          <p>{form.description}</p>
        ) : (
          <p className="job-preview__placeholder">Add a description to preview the role summary.</p>
        )}
      </div>

      {bullets.length > 0 && (
        <div className="job-preview__section">
          <h4>Key Responsibilities &amp; Requirements</h4>
          <ul>
            {bullets.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="job-preview__footer">
        <p className="job-preview__posted">Posted on {postedDate}</p>
        <button type="button" className="job-preview__apply-secondary" tabIndex={-1}>
          Apply Now
        </button>
      </div>
    </div>
  );
}
