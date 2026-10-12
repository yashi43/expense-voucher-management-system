import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SignatureUploader from '../components/SignatureUploader';
import { Save, Send, ArrowLeft, AlertCircle } from 'lucide-react';

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
    employeeSignature: '',
  });

  const [voucherNumber, setVoucherNumber] = useState('');
  const [status, setStatus] = useState('');
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
          if (v.status !== 'Draft') {
            setError(`Cannot edit voucher with status '${v.status}'. Only Draft vouchers can be edited.`);
            setStatus(v.status);
            return;
          }
          setVoucherNumber(v.voucherNumber);
          setStatus(v.status);
          setFormData({
            department: v.department,
            expenseTitle: v.expenseTitle,
            expenseDate: v.expenseDate ? v.expenseDate.split('T')[0] : '',
            expenseCategory: v.expenseCategory,
            expenseDescription: v.expenseDescription || '',
            amount: v.amount,
            employeeSignature: v.employeeSignature || '',
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

  const handleSignatureChange = (sigUrl) => {
    setFormData((prev) => ({ ...prev, employeeSignature: sigUrl }));
  };

  const validateBasicFields = () => {
    if (!formData.department.trim()) return 'Department is mandatory.';
    if (!formData.expenseTitle.trim()) return 'Expense Title is mandatory.';
    if (!formData.expenseDate) return 'Expense Date is mandatory.';
    if (!formData.amount || Number(formData.amount) <= 0)
      return 'Amount is mandatory and must be greater than zero.';
    return null;
  };

  const handleUpdateDraft = async () => {
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
      setError(err.response?.data?.message || 'Failed to update draft voucher');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    const valError = validateBasicFields();
    if (valError) {
      setError(valError);
      return;
    }

    if (!formData.employeeSignature) {
      setError('Employee Signature is mandatory before submitting a voucher for approval.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      // Save updates first
      await api.put(`/vouchers/${id}`, {
        ...formData,
        amount: Number(formData.amount),
      });

      // Submit
      const res = await api.post(`/vouchers/${id}/submit`, {
        employeeSignature: formData.employeeSignature,
      });

      if (res.data.success) {
        navigate(`/vouchers/${id}`);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit voucher');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--slate-500)' }}>Loading draft voucher...</p>
      </div>
    );
  }

  if (status && status !== 'Draft') {
    return (
      <div className="container" style={{ maxWidth: '650px', padding: '3rem 0', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>Editing Restricted</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--slate-600)' }}>
            Voucher <strong>{voucherNumber}</strong> has already been {status}. Per company business rules, vouchers can only be modified while in <strong>Draft</strong> status.
          </p>
          <button onClick={() => navigate(`/vouchers/${id}`)} className="btn btn-primary">
            View Voucher Details
          </button>
        </div>
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
        <h1>Edit Draft Voucher</h1>
        <p style={{ color: 'var(--slate-500)' }}>
          Modifying draft <strong>{voucherNumber}</strong>
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Voucher Details</div>
          <span className="badge badge-draft">Draft</span>
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
            <label className="form-label">Expense Description</label>
            <textarea
              name="expenseDescription"
              rows={3}
              className="form-textarea"
              value={formData.expenseDescription}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <SignatureUploader
              value={formData.employeeSignature}
              onChange={handleSignatureChange}
              label="Employee Signature"
            />
          </div>
        </div>

        <div className="card-footer">
          <button
            type="button"
            onClick={handleUpdateDraft}
            disabled={saving}
            className="btn btn-secondary"
          >
            <Save size={16} /> Save Changes
          </button>
          <button
            type="button"
            onClick={handleSubmitForApproval}
            disabled={saving}
            className="btn btn-primary"
          >
            <Send size={16} /> Save & Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVoucherPage;
