'use client';

import { JOB_TYPES, WORK_MODES, formatJobType } from '../../lib/job-board-utils';

export default function JobBoardFilters({
  jobTypeFilter,
  departmentFilter,
  workMode,
  activeChips,
  onJobTypeChange,
  onDepartmentChange,
  onWorkModeChange,
  onClearChip,
  onClearAll,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-bar-inner">
        <span className="filter-label">Filter</span>

        <div className="fdd">
          <select value={jobTypeFilter} onChange={(e) => onJobTypeChange(e.target.value)} aria-label="Job type">
            <option value="">Job type</option>
            {JOB_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>
                {formatJobType(t)}
              </option>
            ))}
          </select>
          <i className="ti ti-chevron-down" aria-hidden="true" />
        </div>

        <div className="fdd">
          <select
            value={departmentFilter}
            onChange={(e) => onDepartmentChange(e.target.value)}
            aria-label="Department"
          >
            <option value="">Department</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Data">Data</option>
            <option value="Finance">Finance</option>
          </select>
          <i className="ti ti-chevron-down" aria-hidden="true" />
        </div>

        <div className="filter-divider" />

        <div className="ftag-group">
          {WORK_MODES.map((m) => (
            <button
              key={m}
              type="button"
              className={`ftag${workMode === m ? ' active' : ''}`}
              onClick={() => onWorkModeChange(m)}
            >
              {m}
            </button>
          ))}
        </div>

        {activeChips.length > 0 && (
          <div className="active-chips">
            {activeChips.map((chip) => (
              <span key={chip.key} className="chip">
                {chip.label}
                <button type="button" onClick={() => onClearChip(chip.key)} aria-label={`Remove ${chip.label}`}>
                  ×
                </button>
              </span>
            ))}
            <button type="button" className="clear-link" onClick={onClearAll}>
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
