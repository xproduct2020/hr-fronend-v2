'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [permissionLevel, setPermissionLevel] = useState('standard');
  const [error, setError] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setError('');

    const endpoint = mode === 'login' ? '/auth/admin/login' : '/auth/admin/signup';
    const payload = {
      email,
      password,
      ...(mode === 'signup'
        ? {
            displayName,
            permissionLevel: permissionLevel || 'standard'
          }
        : {})
    };

    try {
      const data = await apiRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <div className="card">
        <h1>Admin Portal</h1>
        <p>Admin accounts can authenticate with email and password only.</p>
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
                <input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                <select value={permissionLevel} onChange={(e) => setPermissionLevel(e.target.value)}>
                  <option value="standard">standard</option>
                  <option value="super">super</option>
                </select>
              </>
            ) : null}
          </div>

          {error ? <p className="error">{error}</p> : null}
          <button type="submit">{mode === 'login' ? 'Login as Admin' : 'Create Admin Account'}</button>
        </form>
      </div>
    </main>
  );
}
