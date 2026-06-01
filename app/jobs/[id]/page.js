'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api';

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    apiRequest(`/jobs/${id}`)
      .then((data) => setJob(data.job))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'sans-serif' }}>Loading...</div>;
  if (!job) return (
    <div style={{ padding: 48, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <p>Job not found.</p>
      <Link href="/" style={{ color: '#0070f3' }}>← Back to jobs</Link>
    </div>
  );

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#111', fontWeight: 700, fontSize: 18 }}>HR Platform</Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {token ? (
            <>
              <Link href="/dashboard" style={{ fontSize: 14, color: '#0070f3', textDecoration: 'none' }}>My Applications</Link>
              <button onClick={() => { localStorage.removeItem('token'); setToken(null); }}
                style={{ fontSize: 13, padding: '5px 12px', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', background: '#fff' }}>
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/" style={{ fontSize: 14, padding: '6px 16px', background: '#0070f3', color: '#fff', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '32px auto', padding: '0 16px' }}>
        <Link href="/" style={{ color: '#0070f3', fontSize: 14, textDecoration: 'none' }}>← All jobs</Link>

        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 32, marginTop: 16 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: '0 0 6px', fontSize: 26 }}>{job.title}</h1>
              <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#0070f3' }}>{job.company_name}</p>
              {job.industry && <p style={{ margin: 0, fontSize: 13, color: '#888' }}>{job.industry}</p>}
            </div>
            <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: job.status === 'open' ? '#d4edda' : '#f8d7da',
              color: job.status === 'open' ? '#155724' : '#721c24' }}>
              {job.status}
            </span>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #eee' }}>
            {job.location && (
              <div style={{ fontSize: 14, color: '#555' }}>
                <span style={{ fontWeight: 600 }}>📍 Location</span><br />{job.location}
              </div>
            )}
            <div style={{ fontSize: 14, color: '#555' }}>
              <span style={{ fontWeight: 600 }}>⏱ Job Type</span><br />{job.job_type}
            </div>
            <div style={{ fontSize: 14, color: '#555' }}>
              <span style={{ fontWeight: 600 }}>📅 Posted</span><br />{new Date(job.created_at).toLocaleDateString()}
            </div>
            {job.salary_range && (
              <div style={{ fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: '#555' }}>💰 Salary</span><br />
                {token ? (
                  <strong style={{ color: '#155724' }}>{job.salary_range}</strong>
                ) : (
                  <span
                    onClick={() => router.push('/')}
                    style={{ color: '#888', fontStyle: 'italic', cursor: 'pointer', textDecoration: 'underline' }}>
                    Login to see salary
                  </span>
                )}
              </div>
            )}
            {job.website && (
              <div style={{ fontSize: 14, color: '#555' }}>
                <span style={{ fontWeight: 600 }}>🌐 Website</span><br />
                <a href={job.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>{job.website}</a>
              </div>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, marginBottom: 10 }}>About the Role</h2>
              <p style={{ lineHeight: 1.7, color: '#333', whiteSpace: 'pre-wrap', margin: 0 }}>{job.description}</p>
            </div>
          )}

          {/* Apply CTA */}
          {job.status === 'open' && (
            token ? (
              <button
                onClick={() => router.push(`/jobs/${id}/apply`)}
                style={{ padding: '13px 32px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                Apply Now
              </button>
            ) : (
              <div style={{ background: '#f0f7ff', border: '1px solid #b3d0ff', borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <p style={{ margin: 0, color: '#444', flex: 1 }}>Sign in to apply for this position.</p>
                <Link href="/"
                  style={{ padding: '10px 24px', background: '#0070f3', color: '#fff', borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  Sign In to Apply
                </Link>
              </div>
            )
          )}
          {job.status !== 'open' && (
            <p style={{ color: '#888', fontStyle: 'italic' }}>This position is no longer accepting applications.</p>
          )}
        </div>
      </div>
    </div>
  );
}
