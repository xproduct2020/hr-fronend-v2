function ProgressGauge({ percent }) {
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="js-dash__gauge" aria-label={`${percent}% completed`}>
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="#e53935"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="js-dash__gauge-label">{percent}% completed</span>
    </div>
  );
}

export default function JobSeekerProfileProgress({ profileCompletion }) {
  return (
    <section className="js-dash__card" id="profile">
      <h2 className="js-dash__card-title">workScout Profile</h2>
      <div className="js-dash__progress-card">
        <ProgressGauge percent={profileCompletion} />

        <div className="js-dash__progress-text">
          <p>Reach 70% of your profile to start generating your IT professional CV.</p>
          <a href="#profile">Complete your profile &gt;</a>
        </div>

        <div className="js-dash__templates">
          <div className="js-dash__template-thumb" aria-hidden="true" />
          <div className="js-dash__template-thumb" aria-hidden="true" />
          <button type="button" className="js-dash__template-explore">
            <i className="ti ti-arrow-right" aria-hidden="true" />
            Explore CV templates
          </button>
        </div>
      </div>
    </section>
  );
}
