'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest, authHeader } from '../../../lib/api';

function JobPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    salaryRange: '',
    jobType: 'full-time',
    status: 'open',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(isEdit);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/employer'); return; }

    if (isEdit) {
      // Load existing job data to pre-fill form
      apiRequest('/employer/jobs', { headers: authHeader(t) })
        .then((data) => {
          const job = (data.jobs || []).find((j) => String(j.id) === editId);
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
        })
        .catch(() => {})
        .finally(() => setLoadingJob(false));
    }
  }, [router, isEdit, editId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Job title is required.'); return; }

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

  if (loadingJob) return <div style={{ padding: 40, textAlign: 'center' }}>Loading job...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 560, margin: '48px auto', padding: '0 16px' }}>
      <button
        onClick={() => router.push('/employer/dashboard')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0070f3', fontSize: 14, marginBottom: 20, padding: 0 }}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ marginTop: 0, marginBottom: 24 }}>{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>

      {error && (
        <p style={{ color: '#dc3545', background: '#fff5f5', border: '1px solid #f5c6cb', borderRadius: 6, padding: '10px 14px', marginBottom: 20 }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Job Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Frontend Engineer"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 15, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the role, responsibilities, requirements..."
            rows={5}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Remote, New York, NY"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 15, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Salary Range</label>
          <input
            type="text"
            value={form.salaryRange}
            onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
            placeholder="e.g. $80,000 – $120,000"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 15, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Job Type</label>
            <select
              value={form.jobType}
              onChange={(e) => setForm({ ...form, jobType: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => router.push('/employer/dashboard')}
            style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', background: '#fff', fontSize: 15 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ flex: 2, padding: '12px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}
          >
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function JobPostPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <JobPostForm />
    </Suspense>
  );
}
