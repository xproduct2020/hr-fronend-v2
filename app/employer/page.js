'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GoogleSignIn from '../../components/GoogleSignIn';
import { apiRequest } from '../../lib/api';

export default function EmployerPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [error, setError] = useState('');

  function handleAuthSuccess(data) {
    localStorage.setItem('token', data.token);
    router.push('/dashboard');
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');

    const endpoint = mode === 'login' ? '/auth/employer/login' : '/auth/employer/signup';
    const payload = {
      email,
      password,
      ...(mode === 'signup'
        ? {
            companyName,
            website: website || null,
            industry: industry || null
          }
        : {})
    };

    try {
      const data = await apiRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      handleAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  }

  const googleEndpoint = mode === 'login' ? '/auth/employer/login/google' : '/auth/employer/signup/google';

  return (
    <main>
      <div className="card">
        <h1>Employer Portal</h1>
        <p>Login or create an employer account with email/password or Google.</p>
        <div className="role-links">
          <Link href="/">Job Seeker</Link>
          <Link href="/employer">Employer</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </div>

      <div className="card">
        <div className="auth-switch">
          <button type="button" className={mode === 'login' ? '' : 'secondary'} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={mode === 'signup' ? '' : 'secondary'} onClick={() => setMode('signup')}>Sign Up</button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="row">
            <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {mode === 'signup' ? (
              <>
                <input placeholder="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                <input placeholder="Website (optional)" value={website} onChange={(e) => setWebsite(e.target.value)} />
                <input placeholder="Industry (optional)" value={industry} onChange={(e) => setIndustry(e.target.value)} />
              </>
            ) : null}
          </div>

          {error ? <p className="error">{error}</p> : null}
          <button type="submit">{mode === 'login' ? 'Login as Employer' : 'Create Employer Account'}</button>
        </form>
      </div>

      <div className="card">
        <h3>{mode === 'login' ? 'Or login with Google' : 'Or sign up with Google'}</h3>
        <GoogleSignIn endpoint={googleEndpoint} onSuccess={handleAuthSuccess} onError={setError} />
      </div>
    </main>
  );
}
