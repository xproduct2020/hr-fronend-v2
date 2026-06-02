'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';
import { formatJobType, matchesWorkMode, matchesIndustry } from '../lib/job-board-utils';
import {
  JobBoardShell,
  JobBoardHeader,
  JobBoardFooter,
  JobBoardHero,
  JobBoardFilters,
  JobList,
  AuthModal,
} from '../components/job-board';

export default function JobSeekerPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [skills, setSkills] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [error, setError] = useState('');

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [workMode, setWorkMode] = useState('Any mode');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [token, setToken] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const skipJobTypeFetch = useRef(true);

  const fetchJobs = useCallback(
    async ({ pageNum = 1, append = false } = {}) => {
      setJobsLoading(true);
      try {
        const qs = new URLSearchParams();
        if (search) qs.set('search', search);
        if (locationFilter) qs.set('location', locationFilter);
        if (jobTypeFilter) qs.set('jobType', jobTypeFilter);
        qs.set('page', String(pageNum));
        qs.set('limit', '10');

        const data = await apiRequest(`/jobs?${qs.toString()}`);
        const list = data.jobs || [];
        setTotal(data.total ?? list.length);
        setJobs((prev) => (append ? [...prev, ...list] : list));
        setHasMore(pageNum * (data.limit || 10) < (data.total || 0));
        setPage(pageNum);
      } catch {
        if (!append) {
          setJobs([]);
          setTotal(0);
        }
      } finally {
        setJobsLoading(false);
      }
    },
    [search, locationFilter, jobTypeFilter]
  );

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    fetchJobs({ pageNum: 1 });
  }, [fetchJobs]);

  useEffect(() => {
    if (skipJobTypeFetch.current) {
      skipJobTypeFetch.current = false;
      return;
    }
    fetchJobs({ pageNum: 1 });
  }, [jobTypeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredJobs = useMemo(() => {
    let list = jobs.filter(
      (job) => matchesWorkMode(job, workMode) && matchesIndustry(job, departmentFilter)
    );

    if (sortBy === 'newest') {
      list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [jobs, workMode, departmentFilter, sortBy]);

  const activeChips = useMemo(() => {
    const chips = [];
    if (jobTypeFilter) chips.push({ key: 'jobType', label: formatJobType(jobTypeFilter) });
    if (departmentFilter) chips.push({ key: 'department', label: departmentFilter });
    if (workMode && workMode !== 'Any mode') chips.push({ key: 'workMode', label: workMode });
    if (locationFilter) chips.push({ key: 'location', label: locationFilter });
    return chips;
  }, [jobTypeFilter, departmentFilter, workMode, locationFilter]);

  function clearChip(key) {
    if (key === 'jobType') setJobTypeFilter('');
    if (key === 'department') setDepartmentFilter('');
    if (key === 'workMode') setWorkMode('Any mode');
    if (key === 'location') setLocationFilter('');
  }

  function clearAllFilters() {
    setJobTypeFilter('');
    setDepartmentFilter('');
    setWorkMode('Any mode');
    setLocationFilter('');
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchJobs({ pageNum: 1 });
  }

  function handleAuthSuccess(data) {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setShowAuth(false);
    router.push('/dashboard');
  }

  function openSignIn(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setShowAuth(true);
    setMode('login');
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    const endpoint = mode === 'login' ? '/auth/job-seeker/login' : '/auth/job-seeker/signup';
    const payload = {
      email,
      password,
      ...(mode === 'signup'
        ? {
            fullName,
            skills: skills || null,
            yearsExperience: yearsExperience ? Number(yearsExperience) : null,
          }
        : {}),
    };
    try {
      const data = await apiRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      handleAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  }

  const googleEndpoint =
    mode === 'login' ? '/auth/job-seeker/login/google' : '/auth/job-seeker/signup/google';

  return (
    <JobBoardShell>
      <JobBoardHeader token={token} onAccountClick={() => setShowAuth(true)} />

      <JobBoardHero
        total={total}
        search={search}
        locationFilter={locationFilter}
        onSearchChange={setSearch}
        onLocationChange={setLocationFilter}
        onSubmit={handleSearch}
      />

      <JobBoardFilters
        jobTypeFilter={jobTypeFilter}
        departmentFilter={departmentFilter}
        workMode={workMode}
        activeChips={activeChips}
        onJobTypeChange={setJobTypeFilter}
        onDepartmentChange={setDepartmentFilter}
        onWorkModeChange={setWorkMode}
        onClearChip={clearChip}
        onClearAll={clearAllFilters}
      />

      <JobList
        jobs={filteredJobs}
        jobsLoading={jobsLoading}
        total={total}
        sortBy={sortBy}
        hasMore={hasMore}
        token={token}
        onSortChange={setSortBy}
        onLoadMore={() => fetchJobs({ pageNum: page + 1, append: true })}
        onSignIn={openSignIn}
      />

      <JobBoardFooter onSignInClick={openSignIn} />

      <AuthModal
        open={showAuth}
        mode={mode}
        email={email}
        password={password}
        fullName={fullName}
        skills={skills}
        yearsExperience={yearsExperience}
        error={error}
        googleEndpoint={googleEndpoint}
        onClose={() => setShowAuth(false)}
        onModeChange={setMode}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onFullNameChange={setFullName}
        onSkillsChange={setSkills}
        onYearsExperienceChange={setYearsExperience}
        onSubmit={onSubmit}
        onSuccess={handleAuthSuccess}
        onError={setError}
      />
    </JobBoardShell>
  );
}
