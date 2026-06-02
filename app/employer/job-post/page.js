'use client';

import { Suspense } from 'react';
import JobPostForm from '../../../components/employer-dashboard/JobPostForm';

export default function JobPostPage() {
  return (
    <Suspense fallback={<div className="employer-dash__loading">Loading…</div>}>
      <JobPostForm />
    </Suspense>
  );
}
