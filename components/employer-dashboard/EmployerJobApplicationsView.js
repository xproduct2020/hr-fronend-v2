'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, authHeader } from '../../lib/api';
import EmployerDashboardShell from './EmployerDashboardShell';
import EmployerDashboardHeader from './EmployerDashboardHeader';
import EmployerDashboardFooter from './EmployerDashboardFooter';
import EmployerStatCard from './EmployerStatCard';
import EmployerApplicantCard from './EmployerApplicantCard';

function formatJobType(type) {
  if (!type) return 'Full-time';
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

export default function EmployerJobApplicationsView() {
  const router = useRouter();
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [stats, setStats] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [user, setUser] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/employer/login');
      return;
    }

    Promise.all([
      apiRequest(`/employer/jobs/${jobId}`, { headers: authHeader(token) }),
      apiRequest(`/employer/jobs/${jobId}/applications`, { headers: authHeader(token) }),
      apiRequest('/employer/dashboard', { headers: authHeader(token) }),
      apiRequest('/auth/me', { headers: authHeader(token) }).catch(() => ({ user: null })),
    ])
      .then(([jobData, appsData, dash, me]) => {
        setJob(jobData.job);
        setStats(jobData.stats);
        setApplicants(appsData.applications || []);
        setCompanyName(dash?.employer?.company_name || '');
        setUser(me.user);
      })
      .catch((err) => {
        if (err.message?.includes('403') || err.message?.includes('401')) {
          router.replace('/employer/login');
        } else {
          setError(err.message || 'Failed to load applications.');
        }
      })
      .finally(() => setLoading(false));
  }, [jobId, router]);

  async function updateApplicationStatus(jId, appId, status) {
    try {
      const token = localStorage.getItem('token');
      await apiRequest(`/employer/jobs/${jId}/applications/${appId}`, {
        method: 'PATCH',
        headers: authHeader(token),
        body: JSON.stringify({ status }),
      });
      setApplicants((prev) =>
        prev.map((a) => (a.application_id === appId ? { ...a, application_status: status } : a))
      );
      const token2 = localStorage.getItem('token');
      const jobData = await apiRequest(`/employer/jobs/${jobId}`, { headers: authHeader(token2) });
      setStats(jobData.stats);
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <EmployerDashboardShell>
        <p className="employer-dash__loading">Loading applications…</p>
      </EmployerDashboardShell>
    );
  }

  if (error || !job) {
    return (
      <EmployerDashboardShell>
        <main className="employer-dash__main">
          <p style={{ color: '#f87171' }}>{error || 'Job not found.'}</p>
          <Link href="/employer/dashboard" className="employer-dash__back-link">
            ← Back to dashboard
          </Link>
        </main>
      </EmployerDashboardShell>
    );
  }

  return (
    <EmployerDashboardShell>
      <main className="employer-dash__main">
        <Link href="/employer/dashboard" className="employer-dash__back-link">
          <i className="ti ti-chevron-left" aria-hidden="true" />
          Back to dashboard
        </Link>

        <EmployerDashboardHeader
          pageTitle={job.title}
          pageSubtitle={`${formatJobType(job.job_type)}${job.location ? ` · ${job.location}` : ''}`}
          companyName={companyName}
          userName={companyName}
          userEmail={user?.email}
          onPostJob={() => router.push('/employer/job-post')}
        />

        <div className="employer-job-apps__meta">
          <span className={`employer-job-card__badge employer-job-card__badge--${job.status === 'open' ? 'open' : 'closed'}`}>
            {job.status === 'open' ? 'Open' : 'Closed'}
          </span>
          <span className="employer-job-apps__posted">
            Posted {new Date(job.created_at).toLocaleDateString()}
          </span>
        </div>

        <section className="employer-dash__stats employer-dash__stats--four" aria-label="Application statistics">
          <EmployerStatCard
            label="Total"
            value={stats?.total ?? 0}
            hint="All applications"
            icon="ti-users"
          />
          <EmployerStatCard
            label="Pending"
            value={stats?.pending ?? 0}
            hint="Awaiting review"
            icon="ti-clock"
          />
          <EmployerStatCard
            label="Reviewed"
            value={stats?.reviewed ?? 0}
            hint="In progress"
            icon="ti-eye"
          />
          <EmployerStatCard
            label="Accepted"
            value={stats?.accepted ?? 0}
            hint="Hired / shortlisted"
            icon="ti-check"
          />
        </section>

        <section aria-labelledby="applicants-heading">
          <h2 id="applicants-heading" className="employer-dash__section-title">
            Applicants ({applicants.length})
          </h2>

          {applicants.length === 0 ? (
            <div className="employer-dash__empty">
              <p>No applications for this job yet.</p>
            </div>
          ) : (
            applicants.map((applicant) => (
              <EmployerApplicantCard
                key={applicant.application_id}
                applicant={applicant}
                jobId={jobId}
                onStatusChange={updateApplicationStatus}
              />
            ))
          )}
        </section>
      </main>

      <EmployerDashboardFooter />
    </EmployerDashboardShell>
  );
}
