'use client';

import GoogleSignIn from '../GoogleSignIn';

export default function AuthModal({
  open,
  mode,
  email,
  password,
  fullName,
  skills,
  yearsExperience,
  error,
  googleEndpoint,
  onClose,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onSkillsChange,
  onYearsExperienceChange,
  onSubmit,
  onSuccess,
  onError,
}) {
  if (!open) return null;

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2 id="auth-title">Job Seeker {mode === 'login' ? 'Sign in' : 'Sign up'}</h2>
          <button type="button" className="auth-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="auth-tabs">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              type="button"
              className={`auth-tab${mode === m ? ' active' : ''}`}
              onClick={() => onModeChange(m)}
            >
              {m === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
          />
          {mode === 'signup' && (
            <>
              <input
                placeholder="Full name"
                value={fullName}
                onChange={(e) => onFullNameChange(e.target.value)}
                required
              />
              <input placeholder="Skills (optional)" value={skills} onChange={(e) => onSkillsChange(e.target.value)} />
              <input
                placeholder="Years of experience (optional)"
                type="number"
                min="0"
                value={yearsExperience}
                onChange={(e) => onYearsExperienceChange(e.target.value)}
              />
            </>
          )}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <div className="auth-divider">or</div>
        <GoogleSignIn endpoint={googleEndpoint} onSuccess={onSuccess} onError={onError} />
      </div>
    </div>
  );
}
