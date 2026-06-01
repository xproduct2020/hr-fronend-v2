'use client';

import { useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { apiRequest } from '../lib/api';

export default function GoogleSignIn({ onSuccess, onError, endpoint = '/auth/job-seeker/login/google', extraData = {} }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Keep a ref so the GIS callback always reads the latest values,
  // even though the GoogleLogin button initializes only once.
  const latestRef = useRef({ endpoint, extraData, onSuccess, onError });
  latestRef.current = { endpoint, extraData, onSuccess, onError };

  if (!clientId) return <p className="error">Google sign-in disabled: missing client ID.</p>;

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const { endpoint: ep, extraData: ed, onSuccess: ok, onError: err } = latestRef.current;
        try {
          const result = await apiRequest(ep, {
            method: 'POST',
            body: JSON.stringify({ idToken: credentialResponse.credential, ...ed })
          });
          ok(result);
        } catch (error) {
          err(error.message);
        }
      }}
      onError={() => latestRef.current.onError('Google sign-in failed')}
    />
  );
}
