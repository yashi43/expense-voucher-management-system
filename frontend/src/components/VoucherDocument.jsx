import React from 'react';
import { Printer, Calendar, Building, Tag, CheckCircle2, XCircle, Clock } from 'lucide-react';

const VoucherDocument = ({ voucher }) => {
  if (!voucher) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const resolveImgUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `http://localhost:5000${path}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return <span className="badge badge-draft" style={{ fontSize: '0.85rem' }}>Draft</span>;
      case 'Submitted':
        return (
          <span className="badge badge-submitted" style={{ fontSize: '0.85rem' }}>
            <Clock size={14} /> Pending Approval
          </span>
        );
      case 'Approved':
        return (
          <span className="badge badge-approved" style={{ fontSize: '0.85rem' }}>
            <CheckCircle2 size={14} /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="badge badge-rejected" style={{ fontSize: '0.85rem' }}>
            <XCircle size={14} /> Rejected
          </span>
        );
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="voucher-paper">
      {/* Document Header */}
      <div className="voucher-header">
        <div>
          <div className="voucher-company-name">BHARAT TECH SOLUTIONS PVT. LTD.</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '2px' }}>
            Corporate Expense Reimbursement Management System
          </div>
          <div className="voucher-doc-title" style={{ marginTop: '0.75rem' }}>
            EXPENSE VOUCHER
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 700 }}>
            VOUCHER NUMBER
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
            {voucher.voucherNumber}
          </div>
          <div style={{ marginTop: '0.5rem' }}>{getStatusBadge(voucher.status)}</div>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="voucher-meta-grid">
        <div className="meta-item">
          <span className="meta-label">Claimant Employee</span>
          <span className="meta-value">{voucher.employeeName}</span>
          {voucher.employeeId && (
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              ID: {voucher.employeeId}
            </span>
          )}
        </div>

        <div className="meta-item">
          <span className="meta-label">Department</span>
          <span className="meta-value">
            <Building size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {voucher.department}
          </span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Expense Date</span>
          <span className="meta-value">
            <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {formatDate(voucher.expenseDate)}
          </span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Expense Category</span>
          <span className="meta-value">
            <Tag size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {voucher.expenseCategory}
          </span>
        </div>
      </div>

      {/* Expense Detail Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: 'var(--slate-800)', marginBottom: '0.5rem' }}>Expense Description</h4>
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
            {voucher.expenseTitle}
          </div>
          <p style={{ color: 'var(--slate-700)', whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
            {voucher.description || voucher.expenseDescription || 'No additional notes provided.'}
          </p>
        </div>
      </div>

      {/* Financial Summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--slate-100)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--slate-300)',
          marginBottom: '2.5rem',
        }}
      >
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
          TOTAL CLAIM AMOUNT:
        </span>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          ₹ {Number(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Rejection notice box if rejected */}
      {voucher.status === 'Rejected' && voucher.rejectionReason && (
        <div className="alert alert-danger" style={{ marginBottom: '2.5rem' }}>
          <XCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
              REJECTION REASON (DIRECTOR REMARKS):
            </strong>
            <p style={{ margin: 0, color: '#7f1d1d' }}>{voucher.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Signatures Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
        {/* Employee Signature Box */}
        <div style={{ border: '1px solid var(--slate-300)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            EMPLOYEE SIGNATURE
          </div>
          <div className="signature-box" style={{ background: '#ffffff', minHeight: '90px' }}>
            {voucher.employeeSignature ? (
              <img
                src={resolveImgUrl(voucher.employeeSignature)}
                alt="Employee Signature"
                className="signature-img"
              />
            ) : (
              <span style={{ color: 'var(--slate-400)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                Pending Submission Signature
              </span>
            )}
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
            <strong>{voucher.employeeName}</strong>
            <div style={{ color: 'var(--slate-500)' }}>Submitted: {formatDate(voucher.voucherDate)}</div>
          </div>
        </div>

        {/* Director Approval Signature Box */}
        <div style={{ border: '1px solid var(--slate-300)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            DIRECTOR APPROVAL SIGNATURE
          </div>
          <div className="signature-box" style={{ background: '#ffffff', minHeight: '90px' }}>
            {voucher.status === 'Approved' && voucher.directorSignature ? (
              <img
                src={resolveImgUrl(voucher.directorSignature)}
                alt="Director Signature"
                className="signature-img"
              />
            ) : (
              <span style={{ color: 'var(--slate-400)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                {voucher.status === 'Approved'
                  ? 'Approved without digital signature'
                  : voucher.status === 'Rejected'
                  ? 'Claim Rejected'
                  : 'Pending Director Review'}
              </span>
            )}
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
            <strong>{voucher.directorName || 'Director of Operations'}</strong>
            <div style={{ color: 'var(--slate-500)' }}>
              Decision Date: {formatDate(voucher.approvalDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Information Footer */}
      <div
        style={{
          borderTop: '1px solid var(--slate-200)',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--slate-400)',
        }}
      >
        <span>Created Date: {formatDateTime(voucher.createdAt)}</span>
        <span>Last Updated: {formatDateTime(voucher.updatedAt)}</span>
        <span>Reimbursement Audited By: Accounts Team</span>
      </div>
    </div>
  );
};

export default VoucherDocument;
