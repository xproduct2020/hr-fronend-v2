'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, authHeader } from '../../../lib/api';
import {
  EmployerDashboardShell,
  EmployerDashboardHeader,
  EmployerStatCard,
  EmployerJobCard,
  EmployerApplicantsModal,
  EmployerDashboardFooter,
} from '../../../components/employer-dashboard';

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [viewingJob, setViewingJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/employer/login');
      return;
    }
    Promise.all([
      apiRequest('/employer/dashboard', { headers: authHeader(t) }),
      apiRequest('/employer/jobs', { headers: authHeader(t) }),
      apiRequest('/auth/me', { headers: authHeader(t) }).catch(() => ({ user: null })),
    ])
      .then(([dash, jobsData, me]) => {
        setDashboard(dash);
        setJobs(jobsData.jobs || []);
        setUser(me.user);
      })
      .catch((err) => {
        if (err.message?.includes('403') || err.message?.includes('401')) {
          router.push('/employer/login');
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function viewApplicants(job) {
    setViewingJob(job);
    setApplicants([]);
    setApplicantsLoading(true);
    try {
      const t = localStorage.getItem('token');
      const data = await apiRequest(`/employer/jobs/${job.id}/applications`, { headers: authHeader(t) });
      setApplicants(data.applications || []);
    } catch (err) {
      alert(err.message);
      setViewingJob(null);
    } finally {
      setApplicantsLoading(false);
    }
  }

  async function updateApplicationStatus(jobId, appId, status) {
    try {
      const t = localStorage.getItem('token');
      await apiRequest(`/employer/jobs/${jobId}/applications/${appId}`, {
        method: 'PATCH',
        headers: authHeader(t),
        body: JSON.stringify({ status }),
      });
      setApplicants((prev) =>
        prev.map((a) => (a.application_id === appId ? { ...a, application_status: status } : a))
      );
      refreshStats();
    } catch (err) {
      alert(err.message);
    }
  }

  async function refreshStats() {
    const t = localStorage.getItem('token');
    if (!t) return;
    const dash = await apiRequest('/employer/dashboard', { headers: authHeader(t) });
    setDashboard(dash);
  }

  async function toggleJobStatus(job) {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    const label = newStatus === 'closed' ? 'close' : 'reopen';
    if (!confirm(`Are you sure you want to ${label} this job posting?`)) return;

    try {
      const t = localStorage.getItem('token');
      const data = await apiRequest(`/employer/jobs/${job.id}`, {
        method: 'PUT',
        headers: authHeader(t),
        body: JSON.stringify({
          title: job.title,
          description: job.description,
          location: job.location,
          salaryRange: job.salary_range,
          jobType: job.job_type,
          status: newStatus,
        }),
      });
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, ...data.job, application_count: j.application_count } : j))
      );
      refreshStats();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <EmployerDashboardShell>
        <p className="employer-dash__loading">Loading dashboard…</p>
      </EmployerDashboardShell>
    );
  }

  if (error) {
    return (
      <EmployerDashboardShell>
        <main className="employer-dash__main">
          <p style={{ color: '#f87171' }}>{error}</p>
        </main>
      </EmployerDashboardShell>
    );
  }

  const stats = dashboard?.stats || {};
  const employer = dashboard?.employer;

  return (
    <EmployerDashboardShell>
      <main className="employer-dash__main">
        <EmployerDashboardHeader
          companyName={employer?.company_name}
          userName={employer?.company_name}
          userEmail={user?.email}
          onPostJob={() => router.push('/employer/job-post')}
        />

        <section className="employer-dash__stats" aria-label="Summary statistics">
          <EmployerStatCard
            label="Open Jobs"
            value={stats.open_jobs || 0}
            hint="Active job postings"
            icon="ti-briefcase"
          />
          <EmployerStatCard
            label="Applications"
            value={stats.total_applications || 0}
            hint="Total received"
            icon="ti-file-description"
          />
          <EmployerStatCard
            label="Hired"
            value={stats.accepted_applications || 0}
            hint="Successful placements"
            icon="ti-door-enter"
          />
        </section>

        <section aria-labelledby="job-postings-heading">
          <h2 id="job-postings-heading" className="employer-dash__section-title">
            Job Postings
          </h2>
          {jobs.length === 0 ? (
            <div className="employer-dash__empty">
              <p>No jobs posted yet.</p>
              <button
                type="button"
                className="employer-dash__btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => router.push('/employer/job-post')}
              >
                <i className="ti ti-plus" aria-hidden="true" />
                Post your first job
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <EmployerJobCard
                key={job.id}
                job={job}
                onViewApplications={viewApplicants}
                onEdit={(j) => router.push(`/employer/job-post?id=${j.id}`)}
                onToggleStatus={toggleJobStatus}
              />
            ))
          )}
        </section>
      </main>

      <EmployerDashboardFooter />

      <EmployerApplicantsModal
        job={viewingJob}
        applicants={applicants}
        loading={applicantsLoading}
        onClose={() => setViewingJob(null)}
        onStatusChange={updateApplicationStatus}
      />
    </EmployerDashboardShell>
  );
}
