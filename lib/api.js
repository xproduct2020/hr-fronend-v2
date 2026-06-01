const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(path, options = {}) {
  if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is not configured');

  const { headers: customHeaders, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(customHeaders || {}) },
    ...rest
  });

  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });
