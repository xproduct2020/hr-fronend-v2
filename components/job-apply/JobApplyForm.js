'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest, authHeader } from '../../lib/api';
import { formatLocationLine } from '../../lib/job-board-utils';
import './job-apply.css';

const MAX_COVER = 500;
const MAX_CV_MB = 3;
const MAX_LOCATIONS = 3;

function buildLocationOptions(company, job) {
  const fromCompany = (company?.locations || [])
    .filter((loc) => loc.label?.trim() || loc.address?.trim() || loc.country?.trim())
    .map((loc) => ({
      id: loc.id,
      label: formatLocationLine(loc),
    }));

  if (fromCompany.length) return fromCompany;

  if (job?.location) {
    return [{ id: 'job', label: job.location }];
  }

  return [];
}

function FloatingInput({ id, label, required, value, onChange, type = 'text' }) {
  const filled = Boolean(value?.trim());
  return (
    <div className={`job-apply__field job-apply__input-wrap${filled ? ' job-apply__input-wrap--filled' : ''}`}>
      <input
        id={id}
        type={type}
        className="job-apply__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
      <label className="job-apply__floating-label" htmlFor={id}>
        {label}
        {required && <span className="job-apply__required"> *</span>}
      </label>
    </div>
  );
}

export default function JobApplyForm({ jobId, job, company, profile }) {
  const router = useRouter();
  const fileRef = useRef(null);

  const [cvMode, setCvMode] = useState(profile?.resumeUrl ? 'existing' : 'upload');
  const [resumeFile, setResumeFile] = useState(null);
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationPick, setLocationPick] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const locationOptions = buildLocationOptions(company, job);
  const companyName = company?.companyName || job?.company_name || 'Company';
  const jobTitle = `${job?.title || 'Job'} at ${companyName}`;

  function addLocation(value) {
    if (!value || selectedLocations.includes(value)) return;
    if (selectedLocations.length >= MAX_LOCATIONS) return;
    setSelectedLocations((prev) => [...prev, value]);
    setLocationPick('');
  }

  function removeLocation(value) {
    setSelectedLocations((prev) => prev.filter((loc) => loc !== value));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      setError('Please upload a .doc, .docx, or .pdf file.');
      return;
    }
    if (file.size > MAX_CV_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_CV_MB} MB.`);
      return;
    }

    setError('');
    setResumeFile(file);
    setCvMode('upload');
  }

  async function resolveResumeUrl() {
    if (cvMode === 'existing' && profile?.resumeUrl) {
      return profile.resumeUrl;
    }
    if (!resumeFile) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', resumeFile);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'File upload failed.');
      return data.url;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (!selectedLocations.length) {
      setError('Please select at least one preferred work location.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const resumeUrl = await resolveResumeUrl();
      if (!resumeUrl) {
        setError('Please upload your CV.');
        return;
      }

      setSubmitting(true);
      await apiRequest(`/resumes/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({
          coverLetter: coverLetter.trim() || undefined,
          resumeUrl,
          phone: phone.trim(),
          preferredLocations: selectedLocations,
        }),
      });

      await apiRequest('/job-seekers/me', {
        method: 'PATCH',
        headers: authHeader(token),
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim(), resumeUrl }),
      }).catch(() => null);

      router.push(`/jobs/${jobId}?applied=1`);
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  }

  const charsLeft = MAX_COVER - coverLetter.length;

  return (
    <div className="job-apply">
      <header className="job-apply__header">
        <Link href={`/jobs/${jobId}`} className="job-apply__back">
          <i className="ti ti-chevron-left" aria-hidden="true" />
          Back
        </Link>
        <div className="job-apply__logo">
          work<span>Scout</span>
        </div>
      </header>

      <main className="job-apply__main">
        <div className="job-apply__card">
          <h1 className="job-apply__title">{jobTitle}</h1>

          {error && <p className="job-apply__error" role="alert">{error}</p>}

          <form onSubmit={handleSubmit}>
            <section className="job-apply__section">
              <label className="job-apply__label">
                Your CV <span className="job-apply__required">*</span>
              </label>
              <div className="job-apply__cv-box">
                {profile?.resumeUrl && (
                  <label className="job-apply__cv-option">
                    <input
                      type="radio"
                      name="cvMode"
                      value="existing"
                      checked={cvMode === 'existing'}
                      onChange={() => setCvMode('existing')}
                    />
                    Use my attached CV
                  </label>
                )}
                <label className="job-apply__cv-option">
                  <input
                    type="radio"
                    name="cvMode"
                    value="upload"
                    checked={cvMode === 'upload'}
                    onChange={() => setCvMode('upload')}
                  />
                  Upload a new CV
                </label>
                {cvMode === 'upload' && (
                  <div className="job-apply__file-row">
                    <button
                      type="button"
                      className="job-apply__choose-btn"
                      onClick={() => fileRef.current?.click()}
                    >
                      <i className="ti ti-upload" aria-hidden="true" />
                      Choose file
                    </button>
                    <span className="job-apply__file-name">
                      {resumeFile ? resumeFile.name : 'No file chosen'}
                    </span>
                    <input
                      ref={fileRef}
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
                <p className="job-apply__hint">
                  Please upload a .doc, .docx, or .pdf file, maximum {MAX_CV_MB}MB and no password protection
                </p>
              </div>
            </section>

            <section className="job-apply__section">
              <h2 className="job-apply__section-title">Personal information</h2>
              <FloatingInput
                id="fullName"
                label="Full name"
                required
                value={fullName}
                onChange={setFullName}
              />
              <FloatingInput
                id="phone"
                label="Phone number"
                required
                value={phone}
                onChange={setPhone}
                type="tel"
              />

              <div className="job-apply__field">
                <div
                  className={`job-apply__input-wrap${
                    locationPick || selectedLocations.length ? ' job-apply__input-wrap--filled' : ''
                  }`}
                >
                  <select
                    id="location"
                    className="job-apply__select"
                    value={locationPick}
                    onChange={(e) => addLocation(e.target.value)}
                    disabled={selectedLocations.length >= MAX_LOCATIONS || !locationOptions.length}
                  >
                    <option value="" hidden />
                    {locationOptions
                      .filter((opt) => !selectedLocations.includes(opt.label))
                      .map((opt) => (
                        <option key={opt.id} value={opt.label}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                  <label className="job-apply__floating-label" htmlFor="location">
                    Preferred work location <span className="job-apply__required">*</span>
                  </label>
                </div>
                <p className="job-apply__loc-counter">
                  {selectedLocations.length}/{MAX_LOCATIONS} locations
                </p>
                {selectedLocations.length > 0 && (
                  <div className="job-apply__loc-tags">
                    {selectedLocations.map((loc) => (
                      <span key={loc} className="job-apply__loc-tag">
                        {loc}
                        <button type="button" onClick={() => removeLocation(loc)} aria-label={`Remove ${loc}`}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="job-apply__section">
              <h2 className="job-apply__section-title">
                Cover Letter/Answer
                <span className="job-apply__info-icon" title="Optional introduction for the employer">i</span>
                <span className="job-apply__optional"> (Optional)</span>
              </h2>
              <p className="job-apply__section-subtitle">
                Short introduction about your experience, key skills, and why you&apos;re a strong candidate.
              </p>
              <textarea
                className="job-apply__textarea"
                value={coverLetter}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_COVER) setCoverLetter(e.target.value);
                }}
                placeholder="Short introduction or answers to the employer's questions (if any)."
                rows={5}
              />
              <p className="job-apply__char-count">
                {charsLeft} of {MAX_COVER} characters remaining
              </p>
            </section>

            <button
              type="submit"
              className="job-apply__submit"
              disabled={uploading || submitting}
            >
              {uploading ? 'Uploading CV…' : submitting ? 'Sending…' : 'Send my CV'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
