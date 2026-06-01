'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, authHeader } from '../../../../lib/api';

export default function ApplyPage() {
  const router = useRouter();
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/'); return; }

    apiRequest(`/jobs/${id}`)
      .then((data) => setJob(data.job))
      .catch(() => router.push('/'))
      .finally(() => setJobLoading(false));
  }, [id, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const t = localStorage.getItem('token');
    if (!t) { router.push('/'); return; }

    let resumeUrl = null;

    // Upload resume file first if provided
    if (resumeFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', resumeFile);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'File upload failed.'); return; }
        resumeUrl = data.url;
      } catch {
        setError('File upload failed. Please try again.');
        return;
      } finally {
        setUploading(false);
      }
    }

    setSubmitting(true);
    try {
      await apiRequest(`/resumes/jobs/${id}/apply`, {
        method: 'POST',
        headers: authHeader(t),
        body: JSON.stringify({ coverLetter: coverLetter || undefined, resumeUrl: resumeUrl || undefined }),
      });
      router.push(`/jobs/${id}?applied=1`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (jobLoading) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'sans-serif' }}>Loading...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#111', fontWeight: 700, fontSize: 18 }}>HR Platform</Link>
        <Link href="/dashboard" style={{ fontSize: 14, color: '#0070f3', textDecoration: 'none' }}>My Applications</Link>
      </nav>

      <div style={{ maxWidth: 600, margin: '32px auto', padding: '0 16px' }}>
        <Link href={`/jobs/${id}`} style={{ color: '#0070f3', fontSize: 14, textDecoration: 'none' }}>← Back to job</Link>

        {job && (
          <div style={{ background: '#f0f7ff', border: '1px solid #b3d0ff', borderRadius: 8, padding: '14px 20px', margin: '16px 0' }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{job.title}</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#555' }}>{job.company_name}{job.location ? ` · ${job.location}` : ''}</p>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 28, marginTop: 8 }}>
          <h1 style={{ marginTop: 0, marginBottom: 24, fontSize: 22 }}>Apply for this Position</h1>

          {error && (
            <p style={{ color: '#dc3545', background: '#fff5f5', border: '1px solid #f5c6cb', borderRadius: 6, padding: '10px 14px', marginBottom: 20 }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            {/* Resume upload */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                Upload Resume <span style={{ fontWeight: 400, color: '#888' }}>(optional — PDF, DOC, DOCX, max 5 MB)</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                style={{ width: '100%', padding: '10px 0', fontSize: 14 }}
              />
              {resumeFile && (
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#555' }}>
                  Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>

            {/* Cover letter */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                Cover Letter <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span>
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit for this role..."
                rows={7}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => router.back()}
                style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', background: '#fff', fontSize: 15 }}>
                Cancel
              </button>
              <button type="submit" disabled={uploading || submitting}
                style={{ flex: 2, padding: '12px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                {uploading ? 'Uploading resume...' : submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
