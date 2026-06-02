'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest, authHeader } from '../../lib/api';
import EmployerDashboardShell from './EmployerDashboardShell';
import EmployerDashboardHeader from './EmployerDashboardHeader';
import EmployerDashboardFooter from './EmployerDashboardFooter';
import JobPostPreview from './JobPostPreview';
import './job-post.css';

const INITIAL_FORM = {
  title: '',
  description: '',
  location: '',
  salaryRange: '',
  jobType: 'full-time',
  status: 'open',
};

export default function JobPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);

  const [form, setForm] = useState(INITIAL_FORM);
  const [companyName, setCompanyName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(isEdit);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/employer/login');
      return;
    }

    Promise.all([
      apiRequest('/employer/dashboard', { headers: authHeader(t) }),
      apiRequest('/auth/me', { headers: authHeader(t) }).catch(() => ({ user: null })),
      isEdit ? apiRequest('/employer/jobs', { headers: authHeader(t) }) : Promise.resolve(null),
    ])
      .then(([dash, me, jobsData]) => {
        setCompanyName(dash?.employer?.company_name || '');
        setUserEmail(me?.user?.email || '');

        if (isEdit && jobsData) {
          const job = (jobsData.jobs || []).find((j) => String(j.id) === editId);
          if (job) {
            setForm({
              title: job.title || '',
              description: job.description || '',
              location: job.location || '',
              salaryRange: job.salary_range || '',
              jobType: job.job_type || 'full-time',
              status: job.status || 'open',
            });
          }
        }
      })
      .catch(() => router.push('/employer/login'))
      .finally(() => setLoadingJob(false));
  }, [router, isEdit, editId]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Job title is required.');
      return;
    }

    setError('');
    setLoading(true);
    const t = localStorage.getItem('token');

    try {
      const body = {
        title: form.title.trim(),
        description: form.description || undefined,
        location: form.location || undefined,
        salaryRange: form.salaryRange || undefined,
        jobType: form.jobType,
        status: form.status,
      };

      if (isEdit) {
        await apiRequest(`/employer/jobs/${editId}`, {
          method: 'PUT',
          headers: authHeader(t),
          body: JSON.stringify(body),
        });
      } else {
        await apiRequest('/employer/jobs', {
          method: 'POST',
          headers: authHeader(t),
          body: JSON.stringify(body),
        });
      }
      router.push('/employer/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingJob) {
    return (
      <EmployerDashboardShell>
        <p className="employer-dash__loading">Loading…</p>
      </EmployerDashboardShell>
    );
  }

  return (
    <EmployerDashboardShell>
      <main className="employer-dash__main">
        <EmployerDashboardHeader
          companyName={companyName}
          userName={companyName}
          userEmail={userEmail}
          onPostJob={() => router.push('/employer/job-post')}
        />

        <section className="job-post-page">
          <div className="job-post-page__intro">
            <h2 className="job-post-page__heading">
              {isEdit ? 'Edit Job Posting' : 'Create New Job Posting'}
            </h2>
            <p className="job-post-page__subheading">
              Fill in the details on the left and see a live preview on the right.
            </p>
          </div>

          <div className="job-post-page__grid">
            <div className="job-post-card">
              <h3 className="job-post-card__title">Create Job Posting</h3>

              {error ? <p className="job-post-alert" role="alert">{error}</p> : null}

              <form onSubmit={handleSubmit}>
                <div className="job-post-field">
                  <label htmlFor="title">
                    Job Title <span className="required">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g. Full Stack Developer"
                    required
                  />
                </div>

                <div className="job-post-field">
                  <label htmlFor="companyName">
                    Company Name <span className="required">*</span>
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    readOnly
                    aria-readonly="true"
                  />
                  <p className="job-post-field__hint">From your employer profile</p>
                </div>

                <div className="job-post-field">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    value={form.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="e.g. San Francisco, CA or Remote"
                  />
                </div>

                <div className="job-post-field">
                  <label htmlFor="salaryRange">Salary Range</label>
                  <input
                    id="salaryRange"
                    type="text"
                    value={form.salaryRange}
                    onChange={(e) => updateField('salaryRange', e.target.value)}
                    placeholder="e.g. $150,000 – $200,000"
                  />
                </div>

                <div className="job-post-field">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder={'About the role, responsibilities, requirements…\nUse lines starting with - for bullet lists in the preview.'}
                    rows={8}
                  />
                  <p className="job-post-field__hint">
                    Tip: start lines with &quot;-&quot; for bullet points in the preview.
                  </p>
                </div>

                <div className="job-post-row">
                  <div className="job-post-field">
                    <label htmlFor="jobType">Job Type</label>
                    <select
                      id="jobType"
                      value={form.jobType}
                      onChange={(e) => updateField('jobType', e.target.value)}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <div className="job-post-field">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      value={form.status}
                      onChange={(e) => updateField('status', e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="job-post-actions">
                  <button
                    type="button"
                    className="job-post-btn job-post-btn--secondary"
                    onClick={() => router.push('/employer/dashboard')}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="job-post-btn job-post-btn--primary" disabled={loading}>
                    {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>

            <JobPostPreview form={form} companyName={companyName} />
          </div>
        </section>
      </main>

      <EmployerDashboardFooter />
    </EmployerDashboardShell>
  );
}
