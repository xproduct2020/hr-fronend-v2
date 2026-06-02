'use client';

import { useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { apiRequest } from '../../lib/api';

export default function GoogleAuthButton({
  endpoint,
  extraData = {},
  onSuccess,
  onError,
  onLoadingChange,
  mode = 'login',
  disabled = false,
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const latestRef = useRef({ endpoint, extraData, onSuccess, onError, onLoadingChange });
  latestRef.current = { endpoint, extraData, onSuccess, onError, onLoadingChange };

  if (!clientId) {
    return <p className="auth-alert">Google sign-in is unavailable: missing client ID.</p>;
  }

  return (
    <div className={`auth-google-wrap${disabled ? ' auth-google-wrap--loading' : ''}`}>
      <GoogleLogin
        theme="filled_black"
        size="large"
        width="400"
        text={mode === 'signup' ? 'signup_with' : 'signin_with'}
        onSuccess={async (credentialResponse) => {
          const { endpoint: ep, extraData: ed, onSuccess: ok, onError: err, onLoadingChange: setLoading } =
            latestRef.current;
          setLoading?.(true);
          try {
            const result = await apiRequest(ep, {
              method: 'POST',
              body: JSON.stringify({ idToken: credentialResponse.credential, ...ed }),
            });
            setLoading?.('redirect');
            ok(result);
          } catch (error) {
            setLoading?.(false);
            err(error.message);
          }
        }}
        onError={() => {
          latestRef.current.onLoadingChange?.(false);
          latestRef.current.onError('Google sign-in failed. Please try again.');
        }}
      />
    </div>
  );
}
