'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, authHeader } from '../../lib/api';

export default function EmployerIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/employer/login');
      return;
    }

    apiRequest('/auth/me', { headers: authHeader(token) })
      .then((data) => {
        if (data.user?.role === 'employer') {
          router.replace('/employer/dashboard');
        } else {
          router.replace('/employer/login');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.replace('/employer/login');
      });
  }, [router]);

  return null;
}
