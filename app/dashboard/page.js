'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, authHeader } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [applications, setApplications] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [status, setStatus] = useState('Applied');
  const [error, setError] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) return router.push('/login');
    setToken(t);
    (async () => {
      try {
        const data = await apiRequest('/applications', { headers: authHeader(t) });
        setApplications(data.applications);
      } catch {
        localStorage.removeItem('token');
        router.push('/login');
      }
    })();
  }, [router]);

  async function addApplication(e) {
    e.preventDefault();
    try {
      const data = await apiRequest('/applications', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({ companyName, roleTitle, status })
      });
      setApplications((prev) => [data.application, ...prev]);
      setCompanyName('');
      setRoleTitle('');
      setStatus('Applied');
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeApplication(id) {
    await apiRequest(`/applications/${id}`, { method: 'DELETE', headers: authHeader(token) });
    setApplications((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <main>
      <div className="card"><h2>Dashboard</h2><button className="secondary" onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}>Logout</button></div>
      <div className="card"><h3>Add application</h3><form onSubmit={addApplication}><div className="row">
        <input placeholder="Company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        <input placeholder="Role" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} required />
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option>Applied</option><option>Interview</option><option>Offer</option><option>Rejected</option></select>
      </div>{error ? <p className="error">{error}</p> : null}<button type="submit">Save</button></form></div>
      <div className="card"><h3>Applications</h3>{applications.map((item) => (
        <div key={item.id} className="card"><p>{item.company_name} - {item.role_title}</p><p>Status: {item.status}</p><button className="secondary" onClick={() => removeApplication(item.id)}>Delete</button></div>
      ))}</div>
    </main>
  );
}
