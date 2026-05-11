'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GoogleSignIn from '../../components/GoogleSignIn';
import { apiRequest } from '../../lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  function handleAuthSuccess(data) {
    localStorage.setItem('token', data.token);
    router.push('/dashboard');
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      handleAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <div className="card"><h2>Login</h2><form onSubmit={onSubmit}><div className="row">
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>{error ? <p className="error">{error}</p> : null}<button type="submit">Login</button></form></div>
      <div className="card"><h3>Or continue with Google</h3><GoogleSignIn onSuccess={handleAuthSuccess} onError={setError} /></div>
    </main>
  );
}
