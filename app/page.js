'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';
import { fetchAppliedJobIds } from '../lib/applied-jobs';
import { formatJobType, matchesWorkMode, matchesIndustry } from '../lib/job-board-utils';
import {
  JobBoardShell,
  JobBoardHeader,
  JobBoardFooter,
  JobBoardHero,
  JobBoardFilters,
  JobList,
} from '../components/job-board';

export default function JobSeekerPage() {
  const router = useRouter();

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
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
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
    const t = localStorage.getItem('token');
    setToken(t);
    fetchJobs({ pageNum: 1 });
    if (t) {
      fetchAppliedJobIds(t).then(setAppliedJobIds);
    } else {
      setAppliedJobIds(new Set());
    }
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

  function goToSignIn(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    router.push('/login');
  }

  return (
    <JobBoardShell>
      <JobBoardHeader token={token} />

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
        appliedJobIds={appliedJobIds}
        onSortChange={setSortBy}
        onLoadMore={() => fetchJobs({ pageNum: page + 1, append: true })}
        onSignIn={goToSignIn}
      />

      <JobBoardFooter onSignInClick={goToSignIn} />
    </JobBoardShell>
  );
}
