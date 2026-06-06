import {
  companyInitials,
  countryFlag,
  formatWorkingDays,
} from '../../lib/job-board-utils';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="job-company-card__row">
      <span className="job-company-card__row-label">{label}</span>
      <span className="job-company-card__row-value">{value}</span>
    </div>
  );
}

function CountryValue({ country }) {
  if (!country) return null;
  return (
    <span className="job-company-card__country">
      <span className="job-company-card__flag" aria-hidden="true">
        {countryFlag(country)}
      </span>
      {country}
    </span>
  );
}

export default function JobCompanyCard({ company }) {
  if (!company?.companyName) return null;

  const subtitle =
    company.country && !company.companyName.includes(company.country)
      ? `${company.companyName} ${company.country}`
      : company.locations?.find((loc) => loc.label?.trim())?.label || '';

  const workingDays = formatWorkingDays(company.workingDays);

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
        <div className="job-company-card__title-wrap">
          <h2 className="job-company-card__name">{company.companyName}</h2>
        </div>
      </div>

      {subtitle && subtitle !== company.companyName && (
        <p className="job-company-card__subtitle">{subtitle}</p>
      )}

      <div className="job-company-card__table">
        <InfoRow label="Company type" value={company.companyType} />
        <InfoRow label="Company industry" value={company.industry} />
        <InfoRow label="Company size" value={company.companySize} />
        {company.country && (
          <div className="job-company-card__row">
            <span className="job-company-card__row-label">Country</span>
            <span className="job-company-card__row-value">
              <CountryValue country={company.country} />
            </span>
          </div>
        )}
        <InfoRow label="Working days" value={workingDays} />
      </div>

      {(company.website || company.linkedin || company.facebook) && (
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
      )}
    </aside>
  );
}
