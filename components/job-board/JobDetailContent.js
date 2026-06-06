'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  extractJobSkills,
  formatJobType,
  formatLocationLine,
  formatPostedLabel,
  formatWorkModeLabel,
  OFFICE_GALLERY_IMAGES,
} from '../../lib/job-board-utils';

const SAVED_JOBS_KEY = 'saved_jobs';

function getSavedJobIds() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_JOBS_KEY) || '[]');
  } catch {
    return [];
  }
}

function mapsUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default function JobDetailContent({ job, company, jobId, token, onSignIn }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getSavedJobIds().includes(String(jobId)));
  }, [jobId]);

  function toggleSave() {
    const ids = getSavedJobIds();
    const key = String(jobId);
    const next = ids.includes(key) ? ids.filter((id) => id !== key) : [...ids, key];
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next));
    setSaved(next.includes(key));
  }

  const locations = (company?.locations || [])
    .filter((loc) => loc.label?.trim() || loc.address?.trim() || loc.country?.trim())
    .map((loc) => ({ ...loc, line: formatLocationLine(loc) }));

  const displayLocations =
    locations.length > 0
      ? locations
      : job.location
        ? [{ id: 'job', line: job.location }]
        : [];

  const skills = extractJobSkills(job, company);
  const isOpen = job.status === 'open';
  const showBenefit = Boolean(job.salary_range);

  return (
    <article className="job-detail-main">
      <header className="job-detail-main__header">
        <h1 className="job-detail-main__title">{job.title}</h1>
        {company?.companyName && (
          <p className="job-detail-main__company">{company.companyName}</p>
        )}
        {showBenefit && (
          <p className="job-detail-main__benefit">
            <i className="ti ti-coin" aria-hidden="true" />
            You&apos;ll love it
          </p>
        )}
      </header>

      {isOpen ? (
        <div className="job-detail-main__actions">
          {token ? (
            <Link href={`/jobs/${jobId}/apply`} className="job-detail-main__apply">
              Apply now
            </Link>
          ) : (
            <button type="button" className="job-detail-main__apply" onClick={onSignIn}>
              Apply now
            </button>
          )}
          <button
            type="button"
            className={`job-detail-main__save${saved ? ' job-detail-main__save--active' : ''}`}
            onClick={toggleSave}
            aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
            aria-pressed={saved}
          >
            <i className={saved ? 'ti ti-heart-filled' : 'ti ti-heart'} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <p className="job-detail-main__closed">This position is no longer accepting applications.</p>
      )}

      <div className="job-detail-main__gallery">
        {OFFICE_GALLERY_IMAGES.slice(0, 3).map((src, index) => (
          <div key={src} className="job-detail-main__gallery-item">
            <img src={src} alt="" />
            {index === 2 && OFFICE_GALLERY_IMAGES.length > 3 && (
              <span className="job-detail-main__gallery-more">+{OFFICE_GALLERY_IMAGES.length - 3}</span>
            )}
          </div>
        ))}
      </div>

      <ul className="job-detail-main__meta-list">
        {displayLocations.map((loc) => (
          <li key={loc.id}>
            <i className="ti ti-map-pin" aria-hidden="true" />
            <span>{loc.line}</span>
            <a
              href={mapsUrl(loc.line)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${loc.line} in maps`}
            >
              <i className="ti ti-external-link" aria-hidden="true" />
            </a>
          </li>
        ))}
        <li>
          <i className="ti ti-user" aria-hidden="true" />
          <span>{formatWorkModeLabel(job.location)}</span>
        </li>
        <li>
          <i className="ti ti-clock" aria-hidden="true" />
          <span>{formatPostedLabel(job.created_at)}</span>
        </li>
        {job.salary_range && (
          <li>
            <i className="ti ti-currency-dollar" aria-hidden="true" />
            <span>
              {token ? (
                job.salary_range
              ) : (
                <button type="button" className="job-detail-main__salary-gate" onClick={onSignIn}>
                  Sign in to see salary
                </button>
              )}
            </span>
          </li>
        )}
        <li>
          <i className="ti ti-briefcase" aria-hidden="true" />
          <span>{formatJobType(job.job_type)}</span>
        </li>
      </ul>

      {skills.length > 0 && (
        <section className="job-detail-main__skills">
          <span className="job-detail-main__skills-label">Skills:</span>
          <div className="job-detail-main__skill-tags">
            {skills.map((skill) => (
              <span key={skill} className="job-detail-main__skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {job.description && (
        <section className="job-detail-main__description">
          <h2>About the role</h2>
          <p>{job.description}</p>
        </section>
      )}
    </article>
  );
}
