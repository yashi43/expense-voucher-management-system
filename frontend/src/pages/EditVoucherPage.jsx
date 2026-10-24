import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';

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

const STATUSES = ['Pending', 'Approved', 'Paid', 'Rejected'];

const EditVoucherPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    department: 'Software Engineering',
    expenseTitle: '',
    expenseDate: '',
    expenseCategory: 'Travel & Conveyance',
    description: '',
    amount: '',
    status: 'Pending',
  });

  const [voucherNumber, setVoucherNumber] = useState('');
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
          setFormData({
            employeeName: v.employeeName || '',
            employeeId: v.employeeId || '',
            department: v.department || 'Software Engineering',
            expenseTitle: v.expenseTitle || '',
            expenseDate: v.expenseDate ? v.expenseDate.split('T')[0] : '',
            expenseCategory: v.expenseCategory || 'Miscellaneous',
            description: v.description || v.expenseDescription || '',
            amount: v.amount || '',
            status: v.status || 'Pending',
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.employeeName.trim()) {
      setError('Employee Name is mandatory.');
      return;
    }
    if (!formData.expenseTitle.trim()) {
      setError('Expense Title is mandatory.');
      return;
    }
    if (!formData.expenseDate) {
      setError('Expense Date is mandatory.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Claim Amount in INR (₹) must be greater than zero.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const res = await api.put(`/vouchers/${id}`, {
        ...formData,
        amount: Number(formData.amount),
        expenseDescription: formData.description,
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
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Edit Expense Voucher</h1>
        <p style={{ color: 'var(--slate-500)' }}>
          Update voucher <strong>{voucherNumber}</strong> in MongoDB.
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
          <div className="card-title">Edit Voucher Information</div>
          <span className="badge badge-submitted">{formData.status}</span>
        </div>

        <div className="card-body">
          {/* Employee Info Row */}
          <div className="grid grid-cols-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Employee Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="employeeName"
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
                className="form-control"
                value={formData.employeeId}
                onChange={handleChange}
              />
            </div>
          </div>

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
                  className="form-control"
                  style={{ paddingLeft: '2rem' }}
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
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
                    {st === 'Pending' ? 'Pending Review' : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expense Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Provide context or notes about this expenditure..."
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
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Update & Save in MongoDB'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVoucherPage;
