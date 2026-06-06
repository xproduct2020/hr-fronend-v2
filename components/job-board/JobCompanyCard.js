function companyInitials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function JobCompanyCard({ company }) {
  if (!company?.companyName) return null;

  const hasLocations = company.locations?.some(
    (loc) => loc.label?.trim() || loc.address?.trim() || loc.country?.trim()
  );
  const hasSocial = company.website || company.linkedin || company.facebook;

  return (
    <aside className="job-company-card" aria-label="About the company">
      <div className="job-company-card__header">
        <div className="job-company-card__logo">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={`${company.companyName} logo`} />
          ) : (
            <span className="job-company-card__initials">{companyInitials(company.companyName)}</span>
          )}
        </div>
        <div>
          <h2 className="job-company-card__name">{company.companyName}</h2>
          {company.industry && <p className="job-company-card__industry">{company.industry}</p>}
        </div>
      </div>

      {(company.companyType || company.companySize || company.country) && (
        <ul className="job-company-card__tags">
          {company.companyType && <li>{company.companyType}</li>}
          {company.companySize && <li>{company.companySize}</li>}
          {company.country && <li>{company.country}</li>}
        </ul>
      )}

      {company.workingDays?.length > 0 && (
        <div className="job-company-card__section">
          <h3>Working days</h3>
          <div className="job-company-card__days">
            {company.workingDays.map((day) => (
              <span key={day} className="job-company-card__day">
                {day}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasLocations && (
        <div className="job-company-card__section">
          <h3>Locations</h3>
          <ul className="job-company-card__locations">
            {company.locations
              .filter((loc) => loc.label?.trim() || loc.address?.trim() || loc.country?.trim())
              .map((loc) => (
                <li key={loc.id}>
                  {loc.label && <strong>{loc.label}</strong>}
                  {loc.address && <span>{loc.address}</span>}
                  {loc.country && <span className="job-company-card__loc-country">{loc.country}</span>}
                </li>
              ))}
          </ul>
        </div>
      )}

      {hasSocial && (
        <div className="job-company-card__section">
          <h3>Links</h3>
          <div className="job-company-card__links">
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            )}
            {company.linkedin && (
              <a href={company.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {company.facebook && (
              <a href={company.facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
