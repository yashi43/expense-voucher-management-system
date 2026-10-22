import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

const CreateVoucherPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    department: user?.department || 'Engineering',
    expenseTitle: '',
    expenseDate: new Date().toISOString().split('T')[0],
    expenseCategory: 'Office Supplies',
    expenseDescription: '',
    amount: '',
    employeeSignature: user?.signatureUrl || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // 1. Save as Draft
  const handleSaveDraft = async () => {
    const valError = validateBasicFields();
    if (valError) {
      setError(valError);
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
      console.error('Error saving draft:', err);
      setError(err.response?.data?.message || 'Failed to save voucher draft');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit for Approval (Draft -> Submitted)
  const handleSubmitApproval = async () => {
    const valError = validateBasicFields();
    if (valError) {
      setError(valError);
      return;
    }

    // Rule 9 & 12: Employee Signature is mandatory before submission
    if (!formData.employeeSignature) {
      setError('Employee Signature is mandatory before submitting a voucher for approval. Please upload or draw your signature.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Create voucher first
      const createRes = await api.post('/vouchers', {
        ...formData,
        amount: Number(formData.amount),
      });

      if (createRes.data.success) {
        const voucherId = createRes.data.data._id;
        // Submit for approval
        const submitRes = await api.post(`/vouchers/${voucherId}/submit`, {
          employeeSignature: formData.employeeSignature,
        });

        if (submitRes.data.success) {
          navigate(`/vouchers/${voucherId}`);
        }
      }
    } catch (err) {
      console.error('Error submitting voucher:', err);
      setError(err.response?.data?.message || 'Failed to submit voucher');
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
        <h1>Create Expense Voucher</h1>
        <p style={{ color: 'var(--slate-500)' }}>
          Fill out the reimbursement details below. You can save as draft or submit directly for approval.
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
          <span className="badge badge-draft">New Draft</span>
        </div>

        <div className="card-body">
          {/* Employee Info Header Box */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                Employee Name
              </div>
              <strong style={{ color: 'var(--slate-800)' }}>{user?.name}</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                Employee ID
              </div>
              <span style={{ color: 'var(--slate-700)' }}>{user?.employeeId || 'N/A'}</span>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                Submission Date
              </div>
              <span style={{ color: 'var(--slate-700)' }}>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
            {/* Department */}
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

            {/* Expense Date */}
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
            {/* Expense Title */}
            <div className="form-group">
              <label className="form-label">
                Expense Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="expenseTitle"
                placeholder="e.g. Flight to Tech Conference, Office Equipment..."
                className="form-control"
                value={formData.expenseTitle}
                onChange={handleChange}
                required
              />
            </div>

            {/* Expense Category */}
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

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">
              Claim Amount ($) <span className="required">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="amount"
              placeholder="0.00"
              className="form-control"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <span className="form-hint">Must be greater than $0.00</span>
          </div>

          {/* Expense Description */}
          <div className="form-group">
            <label className="form-label">Expense Description</label>
            <textarea
              name="expenseDescription"
              rows={3}
              placeholder="Provide context, item breakdown, or purpose of the expenditure..."
              className="form-textarea"
              value={formData.expenseDescription}
              onChange={handleChange}
            />
          </div>

          {/* Signature Uploader */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <SignatureUploader
              value={formData.employeeSignature}
              onChange={handleSignatureChange}
              label="Employee Signature"
              required={false}
              defaultProfileSignature={user?.signatureUrl}
            />
            <span className="form-hint">
              Note: You may save this voucher as a draft without a signature, but a signature is strictly required before submitting for approval.
            </span>
          </div>
        </div>

        <div className="card-footer">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading}
            className="btn btn-primary"
          >
            <Save size={16} /> Create Voucher
          </button>
          <button
            type="button"
            onClick={handleSubmitApproval}
            disabled={loading}
            className="btn btn-secondary"
          >
            <Send size={16} /> Submit with Signature
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVoucherPage;
