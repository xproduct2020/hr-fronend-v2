'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, authHeader } from '../../lib/api';
import {
  JobSeekerDashboardShell,
  JobSeekerSidebar,
  JobSeekerProfileHeader,
  JobSeekerCvViewsCard,
  JobSeekerAttachedCv,
  JobSeekerProfileProgress,
  JobSeekerActivities,
} from '../../components/job-seeker-dashboard';

const SAVED_JOBS_KEY = 'saved_jobs';

function getSavedJobsCount() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_JOBS_KEY) || '[]').length;
  } catch {
    return 0;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [savedJobs, setSavedJobs] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (token) => {
    const result = await apiRequest('/job-seekers/me', { headers: authHeader(token) });
    setData(result);
    setSavedJobs(getSavedJobsCount());
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    loadProfile(token)
      .catch(() => {
        localStorage.removeItem('token');
        router.replace('/login');
      })
      .finally(() => setLoading(false));
  }, [router, loadProfile]);

  async function handleToggleCvVisible(cvVisible) {
    const token = localStorage.getItem('token');
    if (!token) return;
    const result = await apiRequest('/job-seekers/me', {
      method: 'PATCH',
      headers: authHeader(token),
      body: JSON.stringify({ cvVisible }),
    });
    setData(result);
  }

  async function handleCvUpload(resumeUrl) {
    const token = localStorage.getItem('token');
    if (!token) return;
    const result = await apiRequest('/job-seekers/me', {
      method: 'PATCH',
      headers: authHeader(token),
      body: JSON.stringify({ resumeUrl }),
    });
    setData(result);
  }

  if (loading) {
    return (
      <JobSeekerDashboardShell>
        <p className="js-dash__loading">Loading dashboard…</p>
      </JobSeekerDashboardShell>
    );
  }

  if (!data?.profile) return null;

  const { profile, stats } = data;

  return (
    <JobSeekerDashboardShell>
      <div className="js-dash__layout">
        <JobSeekerSidebar
          fullName={profile.fullName}
          cvVisible={profile.cvVisible}
          cvViews={stats.cvViews}
          stats={stats}
          onToggleCvVisible={handleToggleCvVisible}
        />

        <div className="js-dash__main">
          <JobSeekerProfileHeader profile={profile} />
          <JobSeekerCvViewsCard cvViews={stats.cvViews} />
          <JobSeekerAttachedCv resumeUrl={profile.resumeUrl} onUpload={handleCvUpload} />
          <JobSeekerProfileProgress profileCompletion={profile.profileCompletion} />
          <JobSeekerActivities
            appliedJobs={stats.appliedJobs}
            savedJobs={savedJobs}
            jobInvitations={stats.jobInvitations}
          />
        </div>
      </div>
    </JobSeekerDashboardShell>
  );
}
