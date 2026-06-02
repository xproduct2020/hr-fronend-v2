'use client';

export default function EmployerApplicantsModal({
  job,
  applicants,
  loading,
  onClose,
  onStatusChange,
}) {
  if (!job) return null;

  return (
    <div className="employer-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="applicants-title">
      <div className="employer-modal">
        <div className="employer-modal__header">
          <h2 id="applicants-title" className="employer-modal__title">
            Applicants — {job.title}
          </h2>
          <button type="button" className="employer-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {loading && <p style={{ color: '#94a3b8' }}>Loading applicants…</p>}
        {!loading && applicants.length === 0 && (
          <p style={{ color: '#94a3b8' }}>No applications yet.</p>
        )}
        {applicants.map((a) => (
          <div key={a.application_id} className="employer-applicant-card">
            <div className="employer-applicant-card__row">
              <div>
                <strong>{a.full_name}</strong>
                <span style={{ color: '#94a3b8', fontSize: 13 }}> — {a.email}</span>
                {a.headline && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>{a.headline}</p>}
              </div>
              <select
                value={a.application_status}
                onChange={(e) => onStatusChange(job.id, a.application_id, e.target.value)}
                aria-label={`Status for ${a.full_name}`}
              >
                {['pending', 'reviewed', 'accepted', 'rejected'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {a.skills && (
              <p style={{ margin: '8px 0 0', fontSize: 13 }}>
                <strong>Skills:</strong> {a.skills}
              </p>
            )}
            {a.cover_letter && (
              <p style={{ margin: '8px 0 0', fontSize: 13 }}>
                <strong>Cover letter:</strong> {a.cover_letter}
              </p>
            )}
            <p style={{ margin: '8px 0 0', fontSize: 11, color: '#64748b' }}>
              Applied {new Date(a.applied_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
