'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GoogleSignIn from '../components/GoogleSignIn';
import { apiRequest } from '../lib/api';

export default function JobSeekerPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [skills, setSkills] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [error, setError] = useState('');

  // Job board state
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [token, setToken] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    fetchJobs();
  }, []);

  async function fetchJobs(params = {}) {
    setJobsLoading(true);
    try {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.location) qs.set('location', params.location);
      const data = await apiRequest(`/jobs${qs.toString() ? '?' + qs.toString() : ''}`);
      setJobs(data.jobs || []);
    } catch {
      // silently ignore
    } finally {
      setJobsLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchJobs({ search, location: locationFilter });
  }

  function handleAuthSuccess(data) {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setShowAuth(false);
    router.push('/dashboard');
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    const endpoint = mode === 'login' ? '/auth/job-seeker/login' : '/auth/job-seeker/signup';
    const payload = {
      email,
      password,
      ...(mode === 'signup' ? { fullName, skills: skills || null, yearsExperience: yearsExperience ? Number(yearsExperience) : null } : {}),
    };
    try {
      const data = await apiRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      handleAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  }

  const googleEndpoint = mode === 'login' ? '/auth/job-seeker/login/google' : '/auth/job-seeker/signup/google';

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <strong style={{ fontSize: 18 }}>HR Platform</strong>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/employer" style={{ fontSize: 14, color: '#555', textDecoration: 'none' }}>For Employers</Link>
          <Link href="/admin" style={{ fontSize: 14, color: '#555', textDecoration: 'none' }}>Admin</Link>
          {token ? (
            <>
              <Link href="/dashboard" style={{ fontSize: 14, color: '#0070f3', textDecoration: 'none', fontWeight: 600 }}>My Applications</Link>
              <button onClick={() => { localStorage.removeItem('token'); setToken(null); }}
                style={{ fontSize: 13, padding: '5px 12px', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', background: '#fff' }}>
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)}
              style={{ fontSize: 14, padding: '6px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
              Sign In / Sign Up
            </button>
          )}
        </div>
      </nav>

      {/* Hero + search */}
      <div style={{ background: '#0070f3', color: '#fff', padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 32 }}>Find Your Next Job</h1>
        <p style={{ margin: '0 0 24px', opacity: 0.85 }}>Browse thousands of open positions</p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, maxWidth: 640, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            placeholder="Job title or keyword"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 2, minWidth: 180, padding: '10px 14px', borderRadius: 6, border: 'none', fontSize: 15 }}
          />
          <input
            placeholder="Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{ flex: 1, minWidth: 120, padding: '10px 14px', borderRadius: 6, border: 'none', fontSize: 15 }}
          />
          <button type="submit"
            style={{ padding: '10px 22px', background: '#fff', color: '#0070f3', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
            Search
          </button>
        </form>
      </div>

      {/* Jobs grid */}
      <div style={{ maxWidth: 960, margin: '32px auto', padding: '0 16px' }}>
        {jobsLoading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>No open jobs found.</p>
        ) : (
          <>
            <p style={{ color: '#555', marginBottom: 16, fontSize: 14 }}>{jobs.length} open position{jobs.length !== 1 ? 's' : ''}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10, padding: 20, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, background: '#e8f0fe', color: '#1a73e8', padding: '2px 8px', borderRadius: 10 }}>
                        {job.job_type}
                      </span>
                      <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#111' }}>{job.title}</h3>
                    <p style={{ margin: '0 0 8px', fontSize: 13, color: '#0070f3', fontWeight: 600 }}>{job.company_name}</p>
                    {job.location && <p style={{ margin: '0 0 8px', fontSize: 13, color: '#666' }}>📍 {job.location}</p>}
                    {job.salary_range ? (
                      token ? (
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#155724', background: '#d4edda', padding: '3px 8px', borderRadius: 6, display: 'inline-block' }}>
                          💰 {job.salary_range}
                        </p>
                      ) : (
                        <p style={{ margin: 0, fontSize: 12, color: '#888', fontStyle: 'italic', cursor: 'pointer' }}
                          onClick={(e) => { e.preventDefault(); setShowAuth(true); }}>
                          🔒 Login to see salary
                        </p>
                      )
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Auth modal */}
      {showAuth && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>Job Seeker {mode === 'login' ? 'Login' : 'Sign Up'}</h2>
              <button onClick={() => setShowAuth(false)} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['login', 'signup'].map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  style={{ flex: 1, padding: '8px', border: `1px solid ${mode === m ? '#0070f3' : '#ccc'}`, borderRadius: 6, cursor: 'pointer', background: mode === m ? '#0070f3' : '#fff', color: mode === m ? '#fff' : '#333', fontWeight: mode === m ? 700 : 400 }}>
                  {m === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                style={{ padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }} />
              <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                style={{ padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }} />
              {mode === 'signup' && (
                <>
                  <input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    style={{ padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }} />
                  <input placeholder="Skills (optional)" value={skills} onChange={(e) => setSkills(e.target.value)}
                    style={{ padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }} />
                  <input placeholder="Years of experience (optional)" type="number" min="0" value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    style={{ padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }} />
                </>
              )}
              {error && <p style={{ color: 'red', margin: 0, fontSize: 13 }}>{error}</p>}
              <button type="submit"
                style={{ padding: '11px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                {mode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
            <div style={{ textAlign: 'center', margin: '16px 0 8px', color: '#aaa', fontSize: 13 }}>or</div>
            <GoogleSignIn endpoint={googleEndpoint} onSuccess={handleAuthSuccess} onError={setError} />
          </div>
        </div>
      )}
    </div>
  );
}
