'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api';
import { fetchAppliedJobIds } from '../../../lib/applied-jobs';
import {
  JobBoardShell,
  JobBoardHeader,
  JobBoardFooter,
  JobCompanyCard,
  JobDetailContent,
} from '../../../components/job-board';

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);

    apiRequest(`/jobs/${id}`)
      .then((data) => {
        setJob(data.job);
        setCompany(data.company || null);
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false));

    if (t) {
      fetchAppliedJobIds(t).then((ids) => setHasApplied(ids.has(String(id))));
    } else {
      setHasApplied(false);
    }
  }, [id]);

  if (loading) {
    return (
      <JobBoardShell>
        <JobBoardHeader token={token} />
        <p className="empty-state">Loading…</p>
        <JobBoardFooter onSignInClick={() => router.push('/')} />
      </JobBoardShell>
    );
  }

  if (!job) {
    return (
      <JobBoardShell>
        <JobBoardHeader token={token} />
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

        <div className="job-detail-layout">
          <JobDetailContent
            job={job}
            company={company}
            jobId={id}
            token={token}
            hasApplied={hasApplied}
            onSignIn={() => router.push('/login')}
          />
          <JobCompanyCard company={company} />
        </div>
      </div>

      <JobBoardFooter onSignInClick={() => router.push('/')} />
    </JobBoardShell>
  );
}
