import React, { useState } from 'react';
import api from '../services/api';
import SignatureUploader from './SignatureUploader';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const DirectorApprovalModal = ({ voucher, actionType, onClose, onSuccess, directorDefaultSignature = '' }) => {
  const [signature, setSignature] = useState(directorDefaultSignature);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isApprove = actionType === 'approve';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isApprove) {
      if (!signature) {
        setError('Director signature is mandatory to approve this expense voucher.');
        return;
      }

      setLoading(true);
      try {
        const res = await api.post(`/vouchers/${voucher._id}/approve`, {
          directorSignature: signature,
        });
        if (res.data.success) {
          onSuccess(res.data.data, 'Voucher successfully approved.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to approve voucher');
      } finally {
        setLoading(false);
      }
    } else {
      // Reject action
      if (!rejectionReason.trim()) {
        setError('Rejection reason is mandatory when rejecting a voucher.');
        return;
      }

      setLoading(true);
      try {
        const res = await api.post(`/vouchers/${voucher._id}/reject`, {
          rejectionReason: rejectionReason.trim(),
        });
        if (res.data.success) {
          onSuccess(res.data.data, 'Voucher rejected with reason provided.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to reject voucher');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />
            ) : (
              <XCircle size={22} style={{ color: 'var(--danger)' }} />
            )}
            <h3 style={{ margin: 0 }}>
              {isApprove ? 'Approve Expense Voucher' : 'Reject Expense Voucher'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '1.25rem', backgroundColor: 'var(--slate-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <div className="flex-between">
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>VOUCHER NUMBER</div>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>{voucher.voucherNumber}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>CLAIM AMOUNT</div>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>${Number(voucher.amount).toFixed(2)}</strong>
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--slate-700)' }}>
                <strong>Title:</strong> {voucher.expenseTitle} ({voucher.employeeName})
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {isApprove ? (
              <div>
                <p style={{ fontSize: '0.925rem', marginBottom: '1rem', color: 'var(--slate-600)' }}>
                  By approving, you authorize reimbursement for this expense claim. Please provide your official Director Signature.
                </p>
                <SignatureUploader
                  value={signature}
                  onChange={setSignature}
                  label="Director Signature"
                  required
                  defaultProfileSignature={directorDefaultSignature}
                />
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label className="form-label">
                    Rejection Reason <span className="required">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Clearly explain the reason for rejecting this claim (e.g. missing receipts, non-compliant expense category, amount exceeds travel cap)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                  <span className="form-hint">
                    This reason will be visible to the employee on their voucher dashboard.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${isApprove ? 'btn-success' : 'btn-danger'}`}
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : isApprove
                ? 'Confirm & Sign Approval'
                : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DirectorApprovalModal;
