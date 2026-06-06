import { apiRequest, authHeader } from './api';

export async function fetchAppliedJobIds(token) {
  if (!token) return new Set();
  try {
    const data = await apiRequest('/resumes/applied-jobs', { headers: authHeader(token) });
    return new Set((data.appliedJobIds || []).map(String));
  } catch {
    return new Set();
  }
}
