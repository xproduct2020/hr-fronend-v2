'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../lib/api';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const data = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main><div className="card"><h2>Create account</h2><form onSubmit={onSubmit}><div className="row">
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
    </div>{error ? <p className="error">{error}</p> : null}<button type="submit">Register</button></form></div></main>
  );
}
