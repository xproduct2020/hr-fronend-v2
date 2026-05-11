'use client';

import { GoogleLogin } from '@react-oauth/google';
import { apiRequest } from '../lib/api';

export default function GoogleSignIn({ onSuccess, onError }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return <p className="error">Google sign-in disabled: missing client ID.</p>;

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          const result = await apiRequest('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken: credentialResponse.credential })
          });
          onSuccess(result);
        } catch (error) {
          onError(error.message);
        }
      }}
      onError={() => onError('Google sign-in failed')}
    />
  );
}
