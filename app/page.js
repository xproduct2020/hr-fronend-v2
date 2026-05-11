import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <div className="card">
        <h1>Job Seeker Application Tracker</h1>
        <p>Authenticate via username/password or Google.</p>
        <div className="row">
          <Link href="/register"><button>Create Account</button></Link>
          <Link href="/login"><button className="secondary">Login</button></Link>
        </div>
      </div>
    </main>
  );
}
