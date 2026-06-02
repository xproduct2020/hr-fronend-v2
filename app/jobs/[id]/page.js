'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api';
import { formatJobType } from '../../../lib/job-board-utils';
import { JobBoardShell, JobBoardHeader, JobBoardFooter } from '../../../components/job-board';

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    apiRequest(`/jobs/${id}`)
      .then((data) => setJob(data.job))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <JobBoardShell>
        <JobBoardHeader token={token} onAccountClick={() => router.push('/')} />
        <p className="empty-state">Loading…</p>
        <JobBoardFooter onSignInClick={() => router.push('/')} />
      </JobBoardShell>
    );
  }

  if (!job) {
    return (
      <JobBoardShell>
        <JobBoardHeader token={token} onAccountClick={() => router.push('/')} />
        <div className="job-detail">
          <p className="empty-state">Job not found.</p>
          <Link href="/" className="job-detail-back">
            ← Back to jobs
          </Link>
        </div>
        <JobBoardFooter onSignInClick={() => router.push('/')} />
      </JobBoardShell>
    );
  }

  return (
    <JobBoardShell>
      <JobBoardHeader token={token} onAccountClick={() => router.push('/')} />

      <div className="job-detail">
        <Link href="/" className="job-detail-back">
          ← All jobs
        </Link>

        <div className="job-detail-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              <h1 className="job-detail-title">{job.title}</h1>
              <p className="job-detail-company">{job.company_name}</p>
              {job.industry && <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>{job.industry}</p>}
            </div>
            <span className={`status-badge ${job.status === 'open' ? 'open' : 'closed'}`}>{job.status}</span>
          </div>

          <div className="job-detail-meta">
            {job.location && (
              <div className="job-detail-meta-item">
                <strong>Location</strong>
                {job.location}
              </div>
            )}
            <div className="job-detail-meta-item">
              <strong>Job type</strong>
              {formatJobType(job.job_type)}
            </div>
            <div className="job-detail-meta-item">
              <strong>Posted</strong>
              {new Date(job.created_at).toLocaleDateString()}
            </div>
            {job.salary_range && (
              <div className="job-detail-meta-item">
                <strong>Salary</strong>
                {token ? (
                  <span style={{ color: 'var(--acc)', fontWeight: 600 }}>{job.salary_range}</span>
                ) : (
                  <button type="button" className="salary-gate" onClick={() => router.push('/')}>
                    Sign in to see salary
                  </button>
                )}
              </div>
            )}
            {job.website && (
              <div className="job-detail-meta-item">
                <strong>Website</strong>
                <a href={job.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--acc)' }}>
                  {job.website}
                </a>
              </div>
            )}
          </div>

          {job.description && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--syne)', fontSize: 18, marginBottom: 10 }}>About the role</h2>
              <p style={{ lineHeight: 1.7, color: 'var(--c3)', whiteSpace: 'pre-wrap', margin: 0 }}>{job.description}</p>
            </div>
          )}

          {job.status === 'open' &&
            (token ? (
              <button type="button" className="job-detail-apply" onClick={() => router.push(`/jobs/${id}/apply`)}>
                Apply now
              </button>
            ) : (
              <div className="job-detail-cta">
                <p style={{ margin: 0, color: 'var(--c3)', flex: 1 }}>Sign in to apply for this position.</p>
                <Link href="/" className="nav-btn">
                  Sign in to apply
                </Link>
              </div>
            ))}

          {job.status !== 'open' && (
            <p style={{ color: 'var(--muted)', fontStyle: 'italic', margin: 0 }}>
              This position is no longer accepting applications.
            </p>
          )}
        </div>
      </div>

      <JobBoardFooter onSignInClick={() => router.push('/')} />
    </JobBoardShell>
  );
}
