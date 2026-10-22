import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VoucherDocument from '../components/VoucherDocument';
import DirectorApprovalModal from '../components/DirectorApprovalModal';
import {
  ArrowLeft,
  Printer,
  Edit2,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

const VoucherDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvalModal, setApprovalModal] = useState({ open: false, action: 'approve' });

  const fetchVoucher = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/vouchers/${id}`);
      if (res.data.success) {
        setVoucher(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load voucher detail', err);
      setError(err.response?.data?.message || 'Error fetching voucher details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  // Handle auto-print if requested in query param
  useEffect(() => {
    if (searchParams.get('print') === 'true' && voucher && !loading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams, voucher, loading]);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this draft voucher?')) return;

    try {
      const res = await api.delete(`/vouchers/${id}`);
      if (res.data.success) {
        navigate('/vouchers');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting voucher');
    }
  };

  const handleSubmit = async () => {
    if (!voucher.employeeSignature && !user?.signatureUrl) {
      alert('An employee signature is required before submitting. Please click "Edit Draft" to upload or draw your signature.');
      return;
    }

    try {
      const res = await api.post(`/vouchers/${id}/submit`, {
        employeeSignature: voucher.employeeSignature || user?.signatureUrl,
      });
      if (res.data.success) {
        fetchVoucher();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit voucher');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--slate-500)' }}>Loading voucher details...</p>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>Error Loading Voucher</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--slate-600)' }}>{error || 'Voucher not found'}</p>
          <button onClick={() => navigate('/vouchers')} className="btn btn-primary">
            Back to Vouchers
          </button>
        </div>
      </div>
    );
  }

  const role = user?.role;
  const isOwner = voucher.employee?._id === user?.id || voucher.employee === user?.id;

  return (
    <div className="container">
      {/* Top Action Bar */}
      <div className="flex-between no-print" style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-2">
          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            title="Print or Save as PDF"
          >
            <Printer size={16} /> Print Voucher
          </button>

          {/* Edit Voucher */}
          <Link to={`/vouchers/edit/${voucher._id}`} className="btn btn-secondary btn-sm">
            <Edit2 size={15} /> Edit Voucher
          </Link>

          {/* Delete Voucher with Confirmation */}
          <button
            onClick={handleDelete}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--danger)' }}
            title="Delete Voucher"
          >
            <Trash2 size={16} /> Delete
          </button>

          {/* Employee Submit if in Draft */}
          {voucher.status === 'Draft' && (
            <button onClick={handleSubmit} className="btn btn-primary btn-sm">
              <Send size={15} /> Submit for Review
            </button>
          )}

          {/* Director review actions if Submitted */}
          {role === 'director' && voucher.status === 'Submitted' && (
            <>
              <button
                onClick={() => setApprovalModal({ open: true, action: 'approve' })}
                className="btn btn-success btn-sm"
              >
                <CheckCircle size={16} /> Approve Claim
              </button>
              <button
                onClick={() => setApprovalModal({ open: true, action: 'reject' })}
                className="btn btn-danger btn-sm"
              >
                <XCircle size={16} /> Reject Claim
              </button>
            </>
          )}
        </div>
      </div>

      {/* Workflow Progress Banner (No-print) */}
      <div
        className="card no-print"
        style={{
          marginBottom: '2rem',
          padding: '1.25rem 1.75rem',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Voucher Workflow Status
        </div>
        <div className="flex items-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          {/* Step 1: Draft */}
          <div className="flex items-center gap-2">
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
              }}
            >
              1
            </span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--slate-800)' }}>Draft Created</span>
          </div>

          <span style={{ color: 'var(--slate-300)' }}>➔</span>

          {/* Step 2: Submitted */}
          <div className="flex items-center gap-2">
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor:
                  voucher.status !== 'Draft' ? 'var(--primary-light)' : 'var(--slate-100)',
                color: voucher.status !== 'Draft' ? 'var(--primary)' : 'var(--slate-400)',
              }}
            >
              2
            </span>
            <span
              style={{
                fontWeight: 600,
                fontSize: '0.9rem',
                color: voucher.status !== 'Draft' ? 'var(--slate-800)' : 'var(--slate-400)',
              }}
            >
              Submitted (Pending Review)
            </span>
          </div>

          <span style={{ color: 'var(--slate-300)' }}>➔</span>

          {/* Step 3: Decision */}
          <div className="flex items-center gap-2">
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor:
                  voucher.status === 'Approved'
                    ? 'var(--success-light)'
                    : voucher.status === 'Rejected'
                    ? 'var(--danger-light)'
                    : 'var(--slate-100)',
                color:
                  voucher.status === 'Approved'
                    ? 'var(--success)'
                    : voucher.status === 'Rejected'
                    ? 'var(--danger)'
                    : 'var(--slate-400)',
              }}
            >
              3
            </span>
            <span
              style={{
                fontWeight: 600,
                fontSize: '0.9rem',
                color:
                  voucher.status === 'Approved'
                    ? 'var(--success)'
                    : voucher.status === 'Rejected'
                    ? 'var(--danger)'
                    : 'var(--slate-400)',
              }}
            >
              {voucher.status === 'Approved'
                ? 'Approved for Reimbursement'
                : voucher.status === 'Rejected'
                ? 'Claim Rejected'
                : 'Director Decision'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Official Voucher Document (Printable) */}
      <VoucherDocument voucher={voucher} />

      {/* Director Approval Modal */}
      {approvalModal.open && (
        <DirectorApprovalModal
          voucher={voucher}
          actionType={approvalModal.action}
          directorDefaultSignature={user?.signatureUrl}
          onClose={() => setApprovalModal({ open: false, action: 'approve' })}
          onSuccess={() => {
            setApprovalModal({ open: false, action: 'approve' });
            fetchVoucher();
          }}
        />
      )}
    </div>
  );
};

export default VoucherDetailPage;
