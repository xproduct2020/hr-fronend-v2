'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, authHeader } from '../../../lib/api';

export default function EmployerDashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Job form state
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', description: '', location: '', salaryRange: '', jobType: 'full-time', status: 'open' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Applicants modal
  const [viewingApplicants, setViewingApplicants] = useState(null); // jobId
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/employer'); return; }
    setToken(t);
    Promise.all([
      apiRequest('/employer/dashboard', { headers: authHeader(t) }),
      apiRequest('/employer/jobs', { headers: authHeader(t) }),
    ])
      .then(([dash, jobsData]) => {
        setDashboard(dash);
        setJobs(jobsData.jobs || []);
      })
      .catch((err) => {
        if (err.message.includes('403') || err.message.includes('401')) router.push('/employer');
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function refreshJobs(t) {
    const data = await apiRequest('/employer/jobs', { headers: authHeader(t) });
    setJobs(data.jobs || []);
  }

  function openNewJobForm() {
    setEditingJob(null);
    setJobForm({ title: '', description: '', location: '', salaryRange: '', jobType: 'full-time', status: 'open' });
    setFormError('');
    setShowJobForm(true);
  }

  function openEditJobForm(job) {
    setEditingJob(job);
    setJobForm({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      salaryRange: job.salary_range || '',
      jobType: job.job_type || 'full-time',
      status: job.status || 'open',
    });
    setFormError('');
    setShowJobForm(true);
  }

  async function submitJobForm(e) {
    e.preventDefault();
    if (!jobForm.title.trim()) { setFormError('Job title is required.'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      if (editingJob) {
        await apiRequest(`/employer/jobs/${editingJob.id}`, {
          method: 'PUT',
          headers: authHeader(token),
          body: JSON.stringify({ ...jobForm, salaryRange: jobForm.salaryRange || undefined }),
        });
      } else {
        await apiRequest('/employer/jobs', {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify({ ...jobForm, salaryRange: jobForm.salaryRange || undefined }),
        });
      }
      await refreshJobs(token);
      setShowJobForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function deleteJob(id) {
    if (!confirm('Delete this job posting?')) return;
    try {
      await apiRequest(`/employer/jobs/${id}`, { method: 'DELETE', headers: authHeader(token) });
      await refreshJobs(token);
    } catch (err) {
      alert(err.message);
    }
  }

  async function viewApplicants(jobId) {
    setViewingApplicants(jobId);
    setApplicants([]);
    setApplicantsLoading(true);
    try {
      const data = await apiRequest(`/employer/jobs/${jobId}/applications`, { headers: authHeader(token) });
      setApplicants(data.applications || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setApplicantsLoading(false);
    }
  }

  async function updateApplicationStatus(jobId, appId, status) {
    try {
      await apiRequest(`/employer/jobs/${jobId}/applications/${appId}`, {
        method: 'PATCH',
        headers: authHeader(token),
        body: JSON.stringify({ status }),
      });
      setApplicants((prev) => prev.map((a) => a.application_id === appId ? { ...a, application_status: status } : a));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: 40, color: 'red' }}>{error}</div>;

  const stats = dashboard?.stats || {};

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>{dashboard?.employer?.company_name || 'Employer Dashboard'}</h1>
          {dashboard?.employer?.industry && <p style={{ margin: '4px 0 0', color: '#666' }}>{dashboard.employer.industry}</p>}
        </div>
        <button onClick={() => { localStorage.removeItem('token'); router.push('/employer'); }}
          style={{ padding: '8px 16px', background: '#eee', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Total Jobs', value: stats.total_jobs || 0 },
          { label: 'Open Jobs', value: stats.open_jobs || 0 },
          { label: 'Closed Jobs', value: stats.closed_jobs || 0 },
          { label: 'Total Applications', value: stats.total_applications || 0 },
          { label: 'Pending', value: stats.pending_applications || 0 },
          { label: 'Reviewed', value: stats.reviewed_applications || 0 },
          { label: 'Accepted', value: stats.accepted_applications || 0 },
          { label: 'Rejected', value: stats.rejected_applications || 0 },
        ].map((s) => (
          <div key={s.label} style={{ background: '#f5f5f5', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Jobs table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Job Postings</h2>
        <button onClick={openNewJobForm}
          style={{ padding: '8px 18px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
          + Post a Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <p style={{ color: '#888' }}>No jobs posted yet. Click &quot;Post a Job&quot; to get started.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              {['Title', 'Type', 'Location', 'Status', 'Posted', 'Actions'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #ddd' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500 }}>{job.title}</td>
                <td style={{ padding: '8px 12px', color: '#555' }}>{job.job_type}</td>
                <td style={{ padding: '8px 12px', color: '#555' }}>{job.location || '—'}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                    background: job.status === 'open' ? '#d4edda' : '#f8d7da',
                    color: job.status === 'open' ? '#155724' : '#721c24' }}>
                    {job.status}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', color: '#777', fontSize: 12 }}>
                  {new Date(job.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <button onClick={() => viewApplicants(job.id)}
                    style={{ marginRight: 6, padding: '4px 10px', cursor: 'pointer', borderRadius: 4, border: '1px solid #0070f3', color: '#0070f3', background: '#fff', fontSize: 12 }}>
                    Applicants
                  </button>
                  <button onClick={() => openEditJobForm(job)}
                    style={{ marginRight: 6, padding: '4px 10px', cursor: 'pointer', borderRadius: 4, border: '1px solid #666', color: '#333', background: '#fff', fontSize: 12 }}>
                    Edit
                  </button>
                  <button onClick={() => deleteJob(job.id)}
                    style={{ padding: '4px 10px', cursor: 'pointer', borderRadius: 4, border: '1px solid #dc3545', color: '#dc3545', background: '#fff', fontSize: 12 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Job form modal */}
      {showJobForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0 }}>{editingJob ? 'Edit Job' : 'Post a New Job'}</h3>
            {formError && <p style={{ color: 'red', marginBottom: 12 }}>{formError}</p>}
            <form onSubmit={submitJobForm}>
              {[
                { label: 'Job Title *', field: 'title', type: 'text' },
                { label: 'Location', field: 'location', type: 'text' },
                { label: 'Salary Range', field: 'salaryRange', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>{label}</label>
                  <input type={type} value={jobForm[field]} onChange={(e) => setJobForm({ ...jobForm, [field]: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Description</label>
                <textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} rows={4}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Job Type</label>
                  <select value={jobForm.jobType} onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }}>
                    {['full-time', 'part-time', 'contract', 'internship'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Status</label>
                  <select value={jobForm.status} onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }}>
                    <option value="open">open</option>
                    <option value="closed">closed</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowJobForm(false)}
                  style={{ padding: '8px 18px', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', background: '#fff' }}>
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                  style={{ padding: '8px 18px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                  {formLoading ? 'Saving...' : editingJob ? 'Save Changes' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicants modal */}
      {viewingApplicants !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: '100%', maxWidth: 700, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Applicants</h3>
              <button onClick={() => setViewingApplicants(null)}
                style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            {applicantsLoading && <p>Loading applicants...</p>}
            {!applicantsLoading && applicants.length === 0 && <p style={{ color: '#888' }}>No applications yet.</p>}
            {applicants.map((a) => (
              <div key={a.application_id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong>{a.full_name}</strong> <span style={{ color: '#888', fontSize: 13 }}>— {a.email}</span>
                    {a.headline && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>{a.headline}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: a.application_status === 'accepted' ? '#d4edda' : a.application_status === 'rejected' ? '#f8d7da' : '#fff3cd',
                      color: a.application_status === 'accepted' ? '#155724' : a.application_status === 'rejected' ? '#721c24' : '#856404' }}>
                      {a.application_status}
                    </span>
                    <select value={a.application_status}
                      onChange={(e) => updateApplicationStatus(viewingApplicants, a.application_id, e.target.value)}
                      style={{ fontSize: 12, padding: '3px 6px', border: '1px solid #ccc', borderRadius: 4 }}>
                      {['pending', 'reviewed', 'accepted', 'rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {a.skills && <p style={{ margin: '8px 0 0', fontSize: 13 }}><strong>Skills:</strong> {a.skills}</p>}
                {a.years_experience != null && <p style={{ margin: '4px 0 0', fontSize: 13 }}><strong>Experience:</strong> {a.years_experience} yrs</p>}
                {a.summary && <p style={{ margin: '8px 0 0', fontSize: 13 }}><strong>Summary:</strong> {a.summary}</p>}
                {a.cover_letter && <p style={{ margin: '8px 0 0', fontSize: 13 }}><strong>Cover Letter:</strong> {a.cover_letter}</p>}
                {a.experience && (
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Work Experience</summary>
                    <pre style={{ margin: '6px 0 0', fontSize: 12, whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 8, borderRadius: 4 }}>
                      {typeof a.experience === 'object' ? JSON.stringify(a.experience, null, 2) : a.experience}
                    </pre>
                  </details>
                )}
                {a.education && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Education</summary>
                    <pre style={{ margin: '6px 0 0', fontSize: 12, whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 8, borderRadius: 4 }}>
                      {typeof a.education === 'object' ? JSON.stringify(a.education, null, 2) : a.education}
                    </pre>
                  </details>
                )}
                <p style={{ margin: '8px 0 0', fontSize: 11, color: '#aaa' }}>Applied {new Date(a.applied_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
