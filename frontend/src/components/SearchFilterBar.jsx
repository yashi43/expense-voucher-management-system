import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Engineering',
  'Marketing',
  'Finance & Accounts',
  'Human Resources',
  'Sales',
  'Operations',
  'Executive Board',
  'Product Design',
];

const CATEGORIES = [
  'All',
  'Travel',
  'Meals & Entertainment',
  'Office Supplies',
  'Software & Tools',
  'Accommodation',
  'Training & Certification',
  'Client Relations',
  'Communication & Internet',
  'Miscellaneous',
];

const STATUSES = ['All', 'Draft', 'Submitted', 'Approved', 'Rejected'];

const SearchFilterBar = ({ filters, onFilterChange, onReset, showRoleFilters = true }) => {
  const [expanded, setExpanded] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="filter-toolbar">
      {/* Top row: Search input + Status dropdown + Quick toggle */}
      <div className="filter-row">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search voucher number, title, employee..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
          />
        </div>

        <div style={{ minWidth: '150px' }}>
          <select
            className="form-select"
            value={filters.status || 'All'}
            onChange={(e) => handleInputChange('status', e.target.value)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'Status: All' : status}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="btn btn-secondary btn-sm"
          style={{ height: '40px' }}
        >
          <Filter size={16} />
          {expanded ? 'Hide Advanced Filters' : 'Advanced Filters'}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="btn btn-ghost btn-sm"
          title="Reset all filters"
          style={{ height: '40px' }}
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* Advanced filters collapsible row */}
      {expanded && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          {/* Department */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Department</label>
            <select
              className="form-select"
              value={filters.department || 'All'}
              onChange={(e) => handleInputChange('department', e.target.value)}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Category */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Expense Category</label>
            <select
              className="form-select"
              value={filters.category || 'All'}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: Start Date */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>From Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.startDate || ''}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
            />
          </div>

          {/* Date Range: End Date */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>To Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.endDate || ''}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
            />
          </div>

          {/* Amount Range: Min */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Min Amount ($)</label>
            <input
              type="number"
              placeholder="0.00"
              className="form-control"
              value={filters.minAmount || ''}
              onChange={(e) => handleInputChange('minAmount', e.target.value)}
            />
          </div>

          {/* Amount Range: Max */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Max Amount ($)</label>
            <input
              type="number"
              placeholder="5000.00"
              className="form-control"
              value={filters.maxAmount || ''}
              onChange={(e) => handleInputChange('maxAmount', e.target.value)}
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Sort By</label>
            <select
              className="form-select"
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
            >
              <option value="createdAt">Date Created</option>
              <option value="expenseDate">Expense Date</option>
              <option value="amount">Amount</option>
              <option value="voucherNumber">Voucher Number</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Order</label>
            <select
              className="form-select"
              value={filters.sortOrder || 'desc'}
              onChange={(e) => handleInputChange('sortOrder', e.target.value)}
            >
              <option value="desc">Descending (High / Newest)</option>
              <option value="asc">Ascending (Low / Oldest)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
