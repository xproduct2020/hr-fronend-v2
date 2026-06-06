'use client';

import { useRef, useState } from 'react';

export default function JobSeekerAttachedCv({ resumeUrl, onUpload }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      setError('Only PDF, DOC, and DOCX files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      await onUpload(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <section className="js-dash__card" id="cv">
      <h2 className="js-dash__card-title">Your Attached CV</h2>

      {resumeUrl ? (
        <div className="js-dash__cv-attached">
          <i className="ti ti-file-text" aria-hidden="true" />
          <div className="js-dash__cv-attached-info">
            <strong>CV uploaded</strong>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
              View attached CV
            </a>
          </div>
          <button
            type="button"
            className="js-dash__btn-red"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Replace'}
          </button>
        </div>
      ) : (
        <div className="js-dash__cv-upload">
          <div className="js-dash__cv-upload-icon">
            <i className="ti ti-file-upload" aria-hidden="true" />
          </div>
          <p>Upload your CV for a quick application and make it visible to recruiters.</p>
          <button
            type="button"
            className="js-dash__btn-red"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload now'}
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: '#dc2626', fontSize: 13, marginTop: 12, marginBottom: 0 }}>{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hidden
        onChange={handleFileChange}
      />
    </section>
  );
}
