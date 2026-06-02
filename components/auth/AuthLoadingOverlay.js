export default function AuthLoadingOverlay({ message = 'Signing you in…' }) {
  return (
    <div className="auth-loading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="auth-loading-overlay__card">
        <div className="auth-loading-overlay__spinner" aria-hidden="true" />
        <p className="auth-loading-overlay__message">{message}</p>
      </div>
    </div>
  );
}
