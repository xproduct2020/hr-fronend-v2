'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, authHeader } from '../../lib/api';
import {
  DEFAULT_COMPANY_SETTINGS,
  saveCompanySettings,
} from '../../lib/company-settings-storage';
import EmployerDashboardShell from './EmployerDashboardShell';
import EmployerDashboardHeader from './EmployerDashboardHeader';
import EmployerDashboardFooter from './EmployerDashboardFooter';
import CompanyLocationsEditor from './CompanyLocationsEditor';
import { uploadCompanyLogo } from '../../lib/upload-company-logo';
import './company-settings.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const COMPANY_TYPES = [
  '',
  'Startup',
  'SME',
  'Enterprise',
  'Agency',
  'Non-profit',
  'Government',
  'Other',
];

const COMPANY_SIZES = [
  '',
  '1–10 employees',
  '11–50 employees',
  '51–200 employees',
  '201–500 employees',
  '501–1,000 employees',
  '1,000+ employees',
];

const INDUSTRIES = [
  '',
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Media & Entertainment',
  'Other',
];

const COUNTRIES = [
  '',
  'United States',
  'United Kingdom',
  'Vietnam',
  'Singapore',
  'Japan',
  'Australia',
  'Germany',
  'Other',
];

export default function CompanySettingsForm() {
  const router = useRouter();
  const [form, setForm] = useState(DEFAULT_COMPANY_SETTINGS);
  const [userEmail, setUserEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/employer/login');
      return;
    }

    Promise.all([
      apiRequest('/employer/company', { headers: authHeader(t) }).catch(() => null),
      apiRequest('/auth/me', { headers: authHeader(t) }).catch(() => ({ user: null })),
    ]).then(([companyRes, me]) => {
      setUserEmail(me?.user?.email || '');
      if (companyRes?.company) {
        setForm(companyRes.company);
        saveCompanySettings(companyRes.company);
      }
      setLoaded(true);
    });
  }, [router]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  }

  function updateLocations(locations) {
    setForm((prev) => ({ ...prev, locations }));
    setMessage({ type: '', text: '' });
  }

  function toggleWorkingDay(day) {
    setForm((prev) => {
      const days = prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: days };
    });
    setMessage({ type: '', text: '' });
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file (PNG, JPG, etc.).' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Logo must be under 2 MB.' });
      return;
    }

    setUploadingLogo(true);
    setMessage({ type: '', text: '' });
    try {
      const url = await uploadCompanyLogo(file);
      updateField('logoUrl', url);
      setMessage({ type: 'success', text: 'Logo uploaded to storage.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  }

  function removeLogo() {
    updateField('logoUrl', '');
  }

  function handleReset() {
    setForm({ ...DEFAULT_COMPANY_SETTINGS });
    localStorage.removeItem('employer_company_settings');
    setMessage({ type: 'success', text: 'Form cleared.' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.companyName.trim()) {
      setMessage({ type: 'error', text: 'Company name is required.' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const t = localStorage.getItem('token');
      const data = await apiRequest('/employer/company', {
        method: 'PUT',
        headers: authHeader(t),
        body: JSON.stringify(form),
      });
      if (data?.company) {
        setForm(data.company);
        saveCompanySettings(data.company);
      }
      setMessage({ type: 'success', text: data?.message || 'Company settings saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <EmployerDashboardShell>
        <p className="employer-dash__loading">Loading…</p>
      </EmployerDashboardShell>
    );
  }

  return (
    <EmployerDashboardShell>
      <main className="employer-dash__main">
        <EmployerDashboardHeader
          pageTitle="Company Settings"
          pageSubtitle="Manage your company profile and public information"
          companyName={form.companyName}
          userEmail={userEmail}
          onPostJob={() => router.push('/employer/job-post')}
          onSettings={() => router.push('/employer/company')}
        />

        <div className="company-settings__intro">
          <h2 className="company-settings__heading">Company Information</h2>
          <p className="company-settings__subheading">
            Update how your company appears to job seekers.
          </p>
        </div>

        <form className="company-settings__form" onSubmit={handleSubmit}>
          {/* Basic info */}
          <section className="company-settings__section">
            <h3 className="company-settings__section-title">
              <i className="ti ti-building" aria-hidden="true" />
              Basic Information
            </h3>
            <div className="company-settings__grid">
              <div className="company-settings__field company-settings__field--full">
                <label htmlFor="companyName">
                  Company Name <span className="required">*</span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Tech Company Inc."
                  required
                />
              </div>

              <div className="company-settings__field company-settings__field--full">
                <label>Company Logo</label>
                <div className="company-settings__logo-row">
                  <div className="company-settings__logo-preview">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Company logo preview" />
                    ) : (
                      <i className="ti ti-photo" aria-hidden="true" />
                    )}
                  </div>
                  <div className="company-settings__logo-actions">
                    <label className={`company-settings__upload-btn${uploadingLogo ? ' company-settings__upload-btn--disabled' : ''}`}>
                      <i className="ti ti-upload" aria-hidden="true" />
                      {uploadingLogo ? 'Uploading…' : 'Upload logo'}
                      <input type="file" accept="image/*" onChange={handleLogoChange} disabled={uploadingLogo} />
                    </label>
                    {form.logoUrl ? (
                      <button
                        type="button"
                        className="company-settings__upload-btn"
                        style={{ marginLeft: 8 }}
                        onClick={removeLogo}
                        disabled={uploadingLogo}
                      >
                        Remove
                      </button>
                    ) : null}
                    <p className="company-settings__hint">
                      PNG or JPG, max 2 MB. Stored in Vercel Blob under <code>company-logo/</code>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="company-settings__field">
                <label htmlFor="companyType">Company Type</label>
                <select
                  id="companyType"
                  value={form.companyType}
                  onChange={(e) => updateField('companyType', e.target.value)}
                >
                  <option value="">Select type</option>
                  {COMPANY_TYPES.filter(Boolean).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="company-settings__field">
                <label htmlFor="industry">Company Industry</label>
                <select
                  id="industry"
                  value={form.industry}
                  onChange={(e) => updateField('industry', e.target.value)}
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.filter(Boolean).map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <div className="company-settings__field">
                <label htmlFor="companySize">Company Size</label>
                <select
                  id="companySize"
                  value={form.companySize}
                  onChange={(e) => updateField('companySize', e.target.value)}
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.filter(Boolean).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="company-settings__field">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.filter(Boolean).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Location & schedule */}
          <section className="company-settings__section">
            <h3 className="company-settings__section-title">
              <i className="ti ti-map-pin" aria-hidden="true" />
              Location &amp; Schedule
            </h3>
            <div className="company-settings__grid">
              <CompanyLocationsEditor
                locations={form.locations}
                onChange={updateLocations}
                countries={COUNTRIES}
              />

              <div className="company-settings__field company-settings__field--full">
                <label>Working Days</label>
                <div className="company-settings__working-days" role="group" aria-label="Working days">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`company-settings__day${form.workingDays.includes(day) ? ' active' : ''}`}
                      onClick={() => toggleWorkingDay(day)}
                      aria-pressed={form.workingDays.includes(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="company-settings__hint">Select your typical working days.</p>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="company-settings__section">
            <h3 className="company-settings__section-title">
              <i className="ti ti-file-description" aria-hidden="true" />
              About the Company
            </h3>
            <div className="company-settings__field">
              <label htmlFor="description">Company Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Tell job seekers about your company culture, mission, and what makes you unique…"
                rows={6}
              />
            </div>
          </section>

          {/* Social & web */}
          <section className="company-settings__section">
            <h3 className="company-settings__section-title">
              <i className="ti ti-world" aria-hidden="true" />
              Online Presence
            </h3>
            <div className="company-settings__grid">
              <div className="company-settings__field">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="company-settings__field">
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                  id="linkedin"
                  type="url"
                  value={form.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/…"
                />
              </div>
              <div className="company-settings__field company-settings__field--full">
                <label htmlFor="facebook">Facebook</label>
                <input
                  id="facebook"
                  type="url"
                  value={form.facebook}
                  onChange={(e) => updateField('facebook', e.target.value)}
                  placeholder="https://facebook.com/…"
                />
              </div>
            </div>
          </section>

          {message.text ? (
            <p
              className={`company-settings__alert company-settings__alert--${message.type}`}
              role="alert"
            >
              {message.text}
            </p>
          ) : null}

          <div className="company-settings__actions">
            <button
              type="button"
              className="company-settings__btn company-settings__btn--secondary"
              onClick={() => router.push('/employer/dashboard')}
            >
              Cancel
            </button>
            <button type="button" className="company-settings__btn company-settings__btn--secondary" onClick={handleReset}>
              Reset
            </button>
            <button type="submit" className="company-settings__btn company-settings__btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </form>
      </main>

      <EmployerDashboardFooter />
    </EmployerDashboardShell>
  );
}
