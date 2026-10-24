import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Save, ArrowLeft, AlertCircle, IndianRupee } from 'lucide-react';

const DEPARTMENTS = [
  'Software Engineering',
  'Marketing & Sales',
  'Finance & Accounts',
  'Human Resources',
  'Operations & Logistics',
  'IT Infrastructure',
  'Executive Board',
];

const CATEGORIES = [
  'Travel & Conveyance',
  'Meals & Refreshments',
  'Office Supplies & Stationery',
  'Software & Cloud Tools',
  'Training & Certification',
  'Client Relations',
  'Miscellaneous',
];

const CreateVoucherPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeName: user?.name || 'Yashi Mehta',
    employeeId: user?.employeeId || 'EMP-101',
    department: user?.department || 'Software Engineering',
    expenseTitle: '',
    expenseDate: new Date().toISOString().split('T')[0],
    expenseCategory: 'Travel & Conveyance',
    description: '',
    amount: '',
    status: 'Pending',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    if (!formData.employeeName.trim()) {
      setError('Employee Name is required.');
      return;
    }
    if (!formData.expenseTitle.trim()) {
      setError('Expense Title is required.');
      return;
    }
    if (!formData.expenseDate) {
      setError('Expense Date is required.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Claim Amount in INR (₹) must be greater than zero.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/vouchers', {
        ...formData,
        amount: Number(formData.amount),
      });

      if (res.data.success) {
        navigate(`/vouchers/${res.data.data._id}`);
      }
    } catch (err) {
      console.error('Error creating voucher:', err);
      setError(err.response?.data?.message || 'Failed to create voucher in MongoDB');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create Expense Voucher</h1>
        <p style={{ color: 'var(--slate-500)' }}>
          Bharat Tech Solutions Pvt. Ltd. — Add a new corporate expense reimbursement claim to MongoDB.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleCreateVoucher} className="card">
        <div className="card-header">
          <div className="card-title">Voucher Claim Information</div>
          <span className="badge badge-submitted">New Voucher</span>
        </div>

        <div className="card-body">
          {/* Employee Details Row */}
          <div className="grid grid-cols-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Employee Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="employeeName"
                placeholder="e.g. Yashi Mehta"
                className="form-control"
                value={formData.employeeName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                placeholder="e.g. EMP-101"
                className="form-control"
                value={formData.employeeId}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Department & Date */}
          <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Department <span className="required">*</span>
              </label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
                required
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Expense Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="expenseDate"
                className="form-control"
                value={formData.expenseDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Expense Title & Category */}
          <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Expense Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="expenseTitle"
                placeholder="e.g. Client Travel Conveyance (Pune to Mumbai)"
                className="form-control"
                value={formData.expenseTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Expense Category <span className="required">*</span>
              </label>
              <select
                name="expenseCategory"
                className="form-select"
                value={formData.expenseCategory}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount (₹) & Status */}
          <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Claim Amount (₹ INR) <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--slate-500)' }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  name="amount"
                  placeholder="2450.00"
                  className="form-control"
                  style={{ paddingLeft: '2rem' }}
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <span className="form-hint">Amount in Indian Rupees (e.g. ₹ 2,450)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid / Settled</option>
              </select>
            </div>
          </div>

          {/* Expense Description */}
          <div className="form-group">
            <label className="form-label">Expense Description / Business Purpose</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Explain the expenditure context, item breakdown, client meeting details, or bill references..."
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            <Save size={16} /> {loading ? 'Saving to MongoDB...' : 'Save & Create Voucher'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVoucherPage;
