import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
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

const STATUSES = ['Draft', 'Submitted', 'Approved', 'Rejected'];

const EditVoucherPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    department: '',
    expenseTitle: '',
    expenseDate: '',
    expenseCategory: '',
    expenseDescription: '',
    amount: '',
    status: 'Draft',
  });

  const [voucherNumber, setVoucherNumber] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/vouchers/${id}`);
        if (res.data.success) {
          const v = res.data.data;
          setVoucherNumber(v.voucherNumber);
          setEmployeeName(v.employeeName);
          setFormData({
            department: v.department || 'Engineering',
            expenseTitle: v.expenseTitle || '',
            expenseDate: v.expenseDate ? v.expenseDate.split('T')[0] : '',
            expenseCategory: v.expenseCategory || 'Miscellaneous',
            expenseDescription: v.expenseDescription || '',
            amount: v.amount || '',
            status: v.status || 'Draft',
          });
        }
      } catch (err) {
        console.error('Failed to load voucher', err);
        setError(err.response?.data?.message || 'Error fetching voucher details');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateBasicFields = () => {
    if (!formData.department.trim()) return 'Department is mandatory.';
    if (!formData.expenseTitle.trim()) return 'Expense Title is mandatory.';
    if (!formData.expenseDate) return 'Expense Date is mandatory.';
    if (!formData.amount || Number(formData.amount) <= 0)
      return 'Amount is mandatory and must be greater than zero.';
    return null;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const valError = validateBasicFields();
    if (valError) {
      setError(valError);
      return;
    }

    setError('');
    setSaving(true);

    try {
      const res = await api.put(`/vouchers/${id}`, {
        ...formData,
        amount: Number(formData.amount),
      });

      if (res.data.success) {
        navigate(`/vouchers/${id}`);
      }
    } catch (err) {
      console.error('Update failed:', err);
      setError(err.response?.data?.message || 'Failed to update voucher');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--slate-500)' }}>Loading voucher details...</p>
      </div>
    );
  }

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
        <h1>Edit Expense Voucher</h1>
        <p style={{ color: 'var(--slate-500)' }}>
          Update voucher <strong>{voucherNumber}</strong> ({employeeName})
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleUpdate} className="card">
        <div className="card-header">
          <div className="card-title">Edit Voucher Details</div>
          <span className="badge badge-draft">{formData.status}</span>
        </div>

        <div className="card-body">
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

          <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Expense Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="expenseTitle"
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

          <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Claim Amount ($) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                className="form-control"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Voucher Status
              </label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st === 'Submitted' ? 'Submitted (Pending Review)' : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expense Description</label>
            <textarea
              name="expenseDescription"
              rows={3}
              placeholder="Provide context or notes about this expenditure..."
              className="form-textarea"
              value={formData.expenseDescription}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="card-footer">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Update & Save Voucher'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVoucherPage;
