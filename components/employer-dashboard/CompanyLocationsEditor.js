'use client';

import { createEmptyLocation } from '../../lib/company-settings-storage';

export default function CompanyLocationsEditor({ locations, onChange, countries = [] }) {
  function updateLocation(id, field, value) {
    onChange(locations.map((loc) => (loc.id === id ? { ...loc, [field]: value } : loc)));
  }

  function addLocation() {
    onChange([...locations, createEmptyLocation()]);
  }

  function removeLocation(id) {
    if (locations.length <= 1) {
      onChange([createEmptyLocation()]);
      return;
    }
    onChange(locations.filter((loc) => loc.id !== id));
  }

  return (
    <div className="company-locations">
      <div className="company-locations__header">
        <label>Office Locations</label>
        <button type="button" className="company-locations__add" onClick={addLocation}>
          <i className="ti ti-plus" aria-hidden="true" />
          Add location
        </button>
      </div>
      <p className="company-settings__hint">Add all offices or branches where your company operates.</p>

      <div className="company-locations__list">
        {locations.map((loc, index) => (
          <div key={loc.id} className="company-locations__item">
            <div className="company-locations__item-header">
              <span className="company-locations__item-num">Location {index + 1}</span>
              {locations.length > 1 ? (
                <button
                  type="button"
                  className="company-locations__remove"
                  onClick={() => removeLocation(loc.id)}
                  aria-label={`Remove location ${index + 1}`}
                >
                  <i className="ti ti-trash" aria-hidden="true" />
                  Remove
                </button>
              ) : null}
            </div>
            <div className="company-locations__fields">
              <div className="company-settings__field">
                <label htmlFor={`loc-label-${loc.id}`}>Location name</label>
                <input
                  id={`loc-label-${loc.id}`}
                  type="text"
                  value={loc.label}
                  onChange={(e) => updateLocation(loc.id, 'label', e.target.value)}
                  placeholder="e.g. Head Office, Hanoi Branch"
                />
              </div>
              <div className="company-settings__field">
                <label htmlFor={`loc-address-${loc.id}`}>Address / City</label>
                <input
                  id={`loc-address-${loc.id}`}
                  type="text"
                  value={loc.address}
                  onChange={(e) => updateLocation(loc.id, 'address', e.target.value)}
                  placeholder="e.g. 123 Main St, San Francisco, CA"
                />
              </div>
              <div className="company-settings__field">
                <label htmlFor={`loc-country-${loc.id}`}>Country</label>
                <select
                  id={`loc-country-${loc.id}`}
                  value={loc.country}
                  onChange={(e) => updateLocation(loc.id, 'country', e.target.value)}
                >
                  <option value="">Select country</option>
                  {countries.filter(Boolean).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
