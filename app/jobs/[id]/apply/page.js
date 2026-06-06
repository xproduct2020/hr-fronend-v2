'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiRequest, authHeader } from '../../../../lib/api';
import { JobApplyForm } from '../../../../components/job-apply';
import '../../../../components/job-apply/job-apply.css';

export default function ApplyPage() {
  const router = useRouter();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    Promise.all([
      apiRequest(`/jobs/${id}`),
      apiRequest('/job-seekers/me', { headers: authHeader(token) }).catch(() => null),
    ])
      .then(([jobData, profileData]) => {
        setJob(jobData.job);
        setCompany(jobData.company || null);
        setProfile(profileData?.profile || null);
      })
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return <div className="job-apply__loading">Loading…</div>;
  }

  if (!job) return null;

  return <JobApplyForm jobId={id} job={job} company={company} profile={profile} />;
}
