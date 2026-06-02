'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiRequest } from '../../lib/api';
import {
  loginSchema,
  jobSeekerSignupSchema,
  employerSignupSchema,
  adminSignupSchema,
  zodFieldErrors,
} from '../../lib/auth-schemas';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';
import AuthInput from './AuthInput';
import AuthDivider from './AuthDivider';
import GoogleAuthButton from './GoogleAuthButton';
import AuthLoadingOverlay from './AuthLoadingOverlay';

function getRoleNav(roleConfig, mode) {
  const isJobSeeker = roleConfig.id === 'jobSeeker';
  const isEmployer = roleConfig.id === 'employer';
  const isAdmin = roleConfig.id === 'admin';

  return [
    {
      label: 'Job Seeker',
      href: isJobSeeker ? (mode === 'login' ? roleConfig.loginPath : roleConfig.signupPath) : '/login',
      active: isJobSeeker,
    },
    {
      label: 'Employer',
      href: isEmployer
        ? mode === 'login'
          ? roleConfig.loginPath
          : roleConfig.signupPath
        : '/employer/login',
      active: isEmployer,
    },
    {
      label: 'Admin',
      href: isAdmin ? (mode === 'login' ? roleConfig.loginPath : roleConfig.signupPath) : '/admin/login',
      active: isAdmin,
    },
  ];
}

const EMPTY = {
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  skills: '',
  yearsExperience: '',
  companyName: '',
  website: '',
  industry: '',
  googleCompanyName: '',
  displayName: '',
  permissionLevel: 'standard',
};

export default function AuthPage({ roleConfig, mode }) {
  const copy = mode === 'login' ? roleConfig.login : roleConfig.signup;
  const alternateHref = mode === 'login' ? roleConfig.signupPath : roleConfig.loginPath;

  const [values, setValues] = useState({ ...EMPTY });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Signing you in…');

  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormError('');
  }

  function validateField(name) {
    const schema = getSchema();
    const result = schema.safeParse(values);
    if (result.success) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      return;
    }
    const errors = zodFieldErrors(result);
    if (errors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: errors[name] }));
    }
  }

  function getSchema() {
    if (mode === 'login') return loginSchema;
    if (roleConfig.id === 'jobSeeker') return jobSeekerSignupSchema;
    if (roleConfig.id === 'employer') return employerSignupSchema;
    return adminSignupSchema;
  }

  function validateAll() {
    const result = getSchema().safeParse(values);
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result));
      return false;
    }
    setFieldErrors({});
    return true;
  }

  function handleAuthSuccess(data) {
    localStorage.setItem('token', data.token);
    setLoadingMessage('Redirecting…');
    setAuthLoading(true);
    // Full navigation avoids lingering on the auth page while client routing catches up
    window.location.replace(roleConfig.successRedirect);
  }

  function handleAuthLoadingChange(state) {
    if (state === false) {
      setAuthLoading(false);
      return;
    }
    if (state === 'redirect') {
      setLoadingMessage('Redirecting…');
      setAuthLoading(true);
      return;
    }
    setLoadingMessage('Signing you in with Google…');
    setAuthLoading(true);
  }

  function buildSignupPayload() {
    if (roleConfig.id === 'jobSeeker') {
      return {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        skills: values.skills || null,
        yearsExperience: values.yearsExperience ? Number(values.yearsExperience) : null,
      };
    }
    if (roleConfig.id === 'employer') {
      return {
        email: values.email,
        password: values.password,
        companyName: values.companyName,
        website: values.website || null,
        industry: values.industry || null,
      };
    }
    return {
      email: values.email,
      password: values.password,
      displayName: values.displayName,
      permissionLevel: values.permissionLevel,
    };
  }

  async function onSubmit(event) {
    event.preventDefault();
    setFormError('');
    if (!validateAll()) return;

    setSubmitting(true);
    setAuthLoading(true);
    setLoadingMessage(mode === 'login' ? 'Signing you in…' : 'Creating your account…');
    const endpoint = mode === 'login' ? roleConfig.loginEndpoint : roleConfig.signupEndpoint;
    const payload =
      mode === 'login'
        ? { email: values.email, password: values.password }
        : buildSignupPayload();

    try {
      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      handleAuthSuccess(data);
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
      setAuthLoading(false);
    } finally {
      setSubmitting(false);
    }
  }

  const googleEndpoint =
    mode === 'login' ? roleConfig.googleLoginEndpoint : roleConfig.googleSignupEndpoint;

  const googleExtra =
    roleConfig.id === 'employer' && mode === 'signup'
      ? { companyName: values.googleCompanyName.trim() || values.companyName.trim() }
      : roleConfig.id === 'jobSeeker' && mode === 'signup'
        ? {
            fullName: values.fullName || undefined,
            skills: values.skills || null,
            yearsExperience: values.yearsExperience ? Number(values.yearsExperience) : null,
          }
        : {};

  const employerGoogleReady =
    roleConfig.id !== 'employer' ||
    mode === 'login' ||
    (values.googleCompanyName.trim() || values.companyName.trim());

  const isBusy = authLoading || submitting;

  return (
    <AuthLayout roleLinks={getRoleNav(roleConfig, mode)}>
      {authLoading ? <AuthLoadingOverlay message={loadingMessage} /> : null}
      <header className="auth-page__header">
        <h1 className="auth-page__title">{copy.pageTitle}</h1>
        <p className="auth-page__subtitle">{copy.pageSubtitle}</p>
      </header>

      <AuthCard
        title={copy.cardTitle}
        subtitle={copy.cardSubtitle}
        footer={
          <p className="auth-footer">
            {copy.alternatePrompt}
            <Link href={alternateHref}>{copy.alternateLabel}</Link>
          </p>
        }
      >
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {mode === 'signup' && roleConfig.id === 'jobSeeker' && (
            <AuthInput
              id="fullName"
              label="Full name"
              value={values.fullName}
              onChange={(e) => setField('fullName', e.target.value)}
              onBlur={() => validateField('fullName')}
              placeholder="Jane Doe"
              error={fieldErrors.fullName}
              autoComplete="name"
            />
          )}

          <AuthInput
            id="email"
            label="Email address"
            type="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={() => validateField('email')}
            placeholder="you@example.com"
            error={fieldErrors.email}
            autoComplete="email"
          />

          <AuthInput
            id="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={(e) => setField('password', e.target.value)}
            onBlur={() => validateField('password')}
            placeholder="••••••••"
            error={fieldErrors.password}
            hint={
              mode === 'signup'
                ? 'At least 8 characters with uppercase, lowercase, and number'
                : undefined
            }
            labelExtra={
              mode === 'login' ? (
                <Link href="/login" className="auth-link" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </Link>
              ) : null
            }
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {mode === 'signup' && (
            <AuthInput
              id="confirmPassword"
              label="Confirm password"
              type="password"
              value={values.confirmPassword}
              onChange={(e) => setField('confirmPassword', e.target.value)}
              onBlur={() => validateField('confirmPassword')}
              placeholder="••••••••"
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
            />
          )}

          {mode === 'signup' && roleConfig.id === 'employer' && (
            <>
              <AuthInput
                id="companyName"
                label="Company name"
                value={values.companyName}
                onChange={(e) => setField('companyName', e.target.value)}
                onBlur={() => validateField('companyName')}
                placeholder="Acme Inc."
                error={fieldErrors.companyName}
                autoComplete="organization"
              />
              <AuthInput
                id="website"
                label="Website (optional)"
                value={values.website}
                onChange={(e) => setField('website', e.target.value)}
                onBlur={() => validateField('website')}
                placeholder="https://example.com"
                error={fieldErrors.website}
                autoComplete="url"
              />
              <AuthInput
                id="industry"
                label="Industry (optional)"
                value={values.industry}
                onChange={(e) => setField('industry', e.target.value)}
                onBlur={() => validateField('industry')}
                placeholder="Technology"
                error={fieldErrors.industry}
              />
            </>
          )}

          {mode === 'signup' && roleConfig.id === 'admin' && (
            <>
              <AuthInput
                id="displayName"
                label="Display name"
                value={values.displayName}
                onChange={(e) => setField('displayName', e.target.value)}
                onBlur={() => validateField('displayName')}
                placeholder="Admin User"
                error={fieldErrors.displayName}
                autoComplete="name"
              />
              <div className="auth-field">
                <label htmlFor="permissionLevel">Permission level</label>
                <select
                  id="permissionLevel"
                  className="auth-input"
                  value={values.permissionLevel}
                  onChange={(e) => setField('permissionLevel', e.target.value)}
                >
                  <option value="standard">Standard</option>
                  <option value="super">Super</option>
                </select>
              </div>
            </>
          )}

          {formError ? (
            <p className="auth-alert" role="alert">
              {formError}
            </p>
          ) : null}

          <button type="submit" className="auth-btn" disabled={isBusy}>
            {submitting ? 'Please wait…' : copy.submitLabel}
          </button>
        </form>

        {roleConfig.showGoogle && (
          <>
            <AuthDivider />
            {mode === 'signup' && roleConfig.id === 'employer' && (
              <>
                <p className="auth-google-hint">Company name required for Google sign-up:</p>
                <AuthInput
                  id="googleCompanyName"
                  label="Company name (for Google)"
                  value={values.googleCompanyName}
                  onChange={(e) => setField('googleCompanyName', e.target.value)}
                  placeholder={values.companyName || 'Acme Inc.'}
                />
              </>
            )}
            {employerGoogleReady ? (
              <GoogleAuthButton
                mode={mode}
                endpoint={googleEndpoint}
                extraData={googleExtra}
                disabled={isBusy}
                onLoadingChange={handleAuthLoadingChange}
                onSuccess={handleAuthSuccess}
                onError={(msg) => {
                  setFormError(msg);
                  setAuthLoading(false);
                }}
              />
            ) : (
              <p className="auth-google-hint">Enter a company name above to enable Google sign-up.</p>
            )}
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
