'use client';

import { useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { apiRequest } from '../../lib/api';

export default function GoogleAuthButton({
  endpoint,
  extraData = {},
  onSuccess,
  onError,
  mode = 'login',
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const latestRef = useRef({ endpoint, extraData, onSuccess, onError });
  latestRef.current = { endpoint, extraData, onSuccess, onError };

  if (!clientId) {
    return <p className="auth-alert">Google sign-in is unavailable: missing client ID.</p>;
  }

  return (
    <div className="auth-google-wrap">
      <GoogleLogin
        theme="filled_black"
        size="large"
        width="400"
        text={mode === 'signup' ? 'signup_with' : 'signin_with'}
        onSuccess={async (credentialResponse) => {
          const { endpoint: ep, extraData: ed, onSuccess: ok, onError: err } = latestRef.current;
          try {
            const result = await apiRequest(ep, {
              method: 'POST',
              body: JSON.stringify({ idToken: credentialResponse.credential, ...ed }),
            });
            ok(result);
          } catch (error) {
            err(error.message);
          }
        }}
        onError={() => latestRef.current.onError('Google sign-in failed. Please try again.')}
      />
    </div>
  );
}
