import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit2, Trash2, Send, CheckCircle, XCircle, Printer } from 'lucide-react';

const VoucherTable = ({
  vouchers,
  currentRole,
  onDelete,
  onSubmit,
  onOpenApproval,
  loading = false,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return <span className="badge badge-draft">Draft</span>;
      case 'Submitted':
        return <span className="badge badge-submitted">Pending Approval</span>;
      case 'Approved':
        return <span className="badge badge-approved">Approved</span>;
      case 'Rejected':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--slate-500)' }}>Loading vouchers data...</p>
      </div>
    );
  }

  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--slate-700)', marginBottom: '0.5rem' }}>No Vouchers Found</h3>
        <p style={{ color: 'var(--slate-500)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
          No expense vouchers match the selected criteria or none have been submitted yet.
        </p>
        {currentRole === 'employee' && (
          <Link to="/vouchers/create" className="btn btn-primary">
            Create First Voucher
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Voucher #</th>
            <th>Expense Date</th>
            {currentRole !== 'employee' && <th>Employee</th>}
            <th>Department</th>
            <th>Category</th>
            <th>Expense Title</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ textAlign: 'center' }}>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => (
            <tr key={v._id}>
              <td>
                <Link
                  to={`/vouchers/${v._id}`}
                  style={{ fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.02em' }}
                >
                  {v.voucherNumber}
                </Link>
              </td>
              <td>{formatDate(v.expenseDate)}</td>
              {currentRole !== 'employee' && (
                <td>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--slate-800)' }}>{v.employeeName}</strong>
                    {v.employeeId && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{v.employeeId}</span>
                    )}
                  </div>
                </td>
              )}
              <td>
                <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)' }}>
                  {v.department}
                </span>
              </td>
              <td>{v.expenseCategory}</td>
              <td>
                <span
                  style={{
                    display: 'inline-block',
                    maxWidth: '220px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 500,
                  }}
                  title={v.expenseTitle}
                >
                  {v.expenseTitle}
                </span>
              </td>
              <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--slate-900)' }}>
                ${Number(v.amount).toFixed(2)}
              </td>
              <td style={{ textAlign: 'center' }}>{getStatusBadge(v.status)}</td>
              <td style={{ textAlign: 'right' }}>
                <div className="action-row" style={{ justifyContent: 'flex-end' }}>
                  {/* View Details Link */}
                  <Link
                    to={`/vouchers/${v._id}`}
                    className="btn btn-ghost btn-sm"
                    title="View Voucher Details"
                  >
                    <Eye size={16} />
                  </Link>

                  {/* Edit Voucher */}
                  <Link
                    to={`/vouchers/edit/${v._id}`}
                    className="btn btn-secondary btn-sm"
                    title="Edit Voucher"
                  >
                    <Edit2 size={15} />
                  </Link>

                  {/* Delete Voucher with Confirmation */}
                  <button
                    type="button"
                    onClick={() => onDelete && onDelete(v._id, v.voucherNumber)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)' }}
                    title="Delete Voucher"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Submit if in Draft */}
                  {v.status === 'Draft' && onSubmit && (
                    <button
                      type="button"
                      onClick={() => onSubmit(v)}
                      className="btn btn-primary btn-sm"
                      title="Submit Voucher for Review"
                    >
                      <Send size={14} /> Submit
                    </button>
                  )}

                  {/* Director Quick Approval Actions */}
                  {currentRole === 'director' && v.status === 'Submitted' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenApproval && onOpenApproval(v, 'approve')}
                        className="btn btn-success btn-sm"
                        title="Approve Voucher"
                      >
                        <CheckCircle size={15} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenApproval && onOpenApproval(v, 'reject')}
                        className="btn btn-danger btn-sm"
                        title="Reject Voucher"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </>
                  )}

                  {/* Print / Export Button */}
                  <Link
                    to={`/vouchers/${v._id}?print=true`}
                    className="btn btn-ghost btn-sm"
                    title="Print Voucher"
                  >
                    <Printer size={16} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VoucherTable;
