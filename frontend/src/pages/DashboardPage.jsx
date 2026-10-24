import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VoucherTable from '../components/VoucherTable';
import DirectorApprovalModal from '../components/DirectorApprovalModal';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvalModal, setApprovalModal] = useState({ open: false, voucher: null, action: 'approve' });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
      setError('Could not load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenApproval = (voucher, action) => {
    setApprovalModal({ open: true, voucher, action });
  };

  const handleApprovalSuccess = () => {
    setApprovalModal({ open: false, voucher: null, action: 'approve' });
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--slate-500)' }}>Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const role = user?.role;
  const stats = data?.stats || {};

  return (
    <div className="container">
      {/* Header section with welcome note */}
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ color: 'var(--slate-600)' }}>
            {role === 'employee' && 'Track and manage your corporate expense vouchers and reimbursement status.'}
            {role === 'director' && 'Executive overview: Review and authorize company expense claims.'}
            {role === 'accounts' && 'Accounts & Finance Portal: Monitor organization-wide reimbursements.'}
          </p>
        </div>

        {role === 'employee' && (
          <Link to="/vouchers/create" className="btn btn-primary">
            <PlusCircle size={18} /> New Expense Voucher
          </Link>
        )}

        {role === 'director' && (
          <Link to="/vouchers/pending" className="btn btn-primary">
            <Clock size={18} /> Review Pending Claims ({stats.pendingApprovalCount || 0})
          </Link>
        )}

        {role === 'accounts' && (
          <Link to="/vouchers" className="btn btn-secondary">
            <FileText size={18} /> View All Organization Vouchers
          </Link>
        )}
      </div>

      {/* =========================================================================
         8.1 EMPLOYEE DASHBOARD
         ========================================================================= */}
      {role === 'employee' && (
        <>
          <div className="grid grid-cols-3" style={{ marginBottom: '2.5rem' }}>
            {/* Total Vouchers */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Total Vouchers</span>
                <span className="stat-value">{stats.totalVouchers || 0}</span>
              </div>
              <div className="stat-icon stat-blue">
                <FileText size={24} />
              </div>
            </div>

            {/* Total Claimed Amount */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Total Claimed</span>
                <span className="stat-value">₹ {Number(stats.totalAmountClaimed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="stat-icon stat-green">
                <IndianRupee size={24} />
              </div>
            </div>

            {/* Pending Approval */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Pending Approval</span>
                <span className="stat-value">{stats.pendingApproval || 0}</span>
              </div>
              <div className="stat-icon stat-amber">
                <Clock size={24} />
              </div>
            </div>

            {/* Approved Vouchers */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Approved Vouchers</span>
                <span className="stat-value">{stats.approvedVouchers || 0}</span>
              </div>
              <div className="stat-icon stat-green">
                <CheckCircle size={24} />
              </div>
            </div>

            {/* Rejected Vouchers */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Rejected Vouchers</span>
                <span className="stat-value">{stats.rejectedVouchers || 0}</span>
              </div>
              <div className="stat-icon stat-red">
                <XCircle size={24} />
              </div>
            </div>

            {/* Draft Vouchers */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Draft Vouchers</span>
                <span className="stat-value">{stats.draftVouchers || 0}</span>
              </div>
              <div className="stat-icon stat-slate">
                <FileCheck size={24} />
              </div>
            </div>
          </div>

          {/* Recent Vouchers Section */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <div className="card-title">Recent Voucher Activity</div>
              <Link to="/vouchers" className="btn btn-ghost btn-sm">
                View All My Vouchers <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <VoucherTable
                vouchers={data?.recentVouchers || []}
                currentRole={role}
                onSubmit={async (voucher) => {
                  try {
                    await api.post(`/vouchers/${voucher._id}/submit`);
                    fetchDashboardData();
                  } catch (e) {
                    alert(e.response?.data?.message || 'Error submitting');
                  }
                }}
                onDelete={async (id) => {
                  if (confirm('Are you sure you want to delete this draft voucher?')) {
                    try {
                      await api.delete(`/vouchers/${id}`);
                      fetchDashboardData();
                    } catch (e) {
                      alert(e.response?.data?.message || 'Error deleting');
                    }
                  }
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
         8.2 DIRECTOR DASHBOARD
         ========================================================================= */}
      {role === 'director' && (
        <>
          <div className="grid grid-cols-4" style={{ marginBottom: '2.5rem' }}>
            {/* Pending Approvals */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Pending Approval</span>
                <span className="stat-value">{stats.pendingApprovalCount || 0}</span>
              </div>
              <div className="stat-icon stat-amber">
                <Clock size={24} />
              </div>
            </div>

            {/* Total Pending Amount */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Total Pending Amount</span>
                <span className="stat-value">₹ {Number(stats.totalPendingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="stat-icon stat-blue">
                <IndianRupee size={24} />
              </div>
            </div>

            {/* Approved Today */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Approved Today</span>
                <span className="stat-value">{stats.approvedToday || 0}</span>
              </div>
              <div className="stat-icon stat-green">
                <CheckCircle size={24} />
              </div>
            </div>

            {/* Rejected Today */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Rejected Today</span>
                <span className="stat-value">{stats.rejectedToday || 0}</span>
              </div>
              <div className="stat-icon stat-red">
                <XCircle size={24} />
              </div>
            </div>
          </div>

          {/* Recent Voucher Activity Table */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <div className="card-title">Recent Organization Claims</div>
              <Link to="/vouchers" className="btn btn-ghost btn-sm">
                View All Vouchers <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <VoucherTable
                vouchers={data?.recentActivity || []}
                currentRole={role}
                onOpenApproval={handleOpenApproval}
              />
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
         8.3 ACCOUNTS DASHBOARD
         ========================================================================= */}
      {role === 'accounts' && (
        <>
          <div className="grid grid-cols-4" style={{ marginBottom: '2.5rem' }}>
            {/* Total Vouchers */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Total Vouchers</span>
                <span className="stat-value">{stats.totalVouchers || 0}</span>
              </div>
              <div className="stat-icon stat-blue">
                <FileText size={24} />
              </div>
            </div>

            {/* Total Approved Reimbursements */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Approved Reimbursement</span>
                <span className="stat-value">₹ {Number(stats.totalApprovedExpenseAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="stat-icon stat-green">
                <TrendingUp size={24} />
              </div>
            </div>

            {/* Pending Approval */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Pending Approval</span>
                <span className="stat-value">{stats.pendingApproval || 0}</span>
              </div>
              <div className="stat-icon stat-amber">
                <Clock size={24} />
              </div>
            </div>

            {/* Approved Vouchers Count */}
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Approved Vouchers</span>
                <span className="stat-value">{stats.approvedVouchers || 0}</span>
              </div>
              <div className="stat-icon stat-green">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          {/* Recent Approved Vouchers ready for reimbursement */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <div className="card-title">Recent Approved Vouchers (Ready for Reimbursement)</div>
              <Link to="/vouchers?status=Approved" className="btn btn-ghost btn-sm">
                View All Approved Claims <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <VoucherTable
                vouchers={data?.recentApprovedVouchers || []}
                currentRole={role}
              />
            </div>
          </div>
        </>
      )}

      {/* Director approval/reject modal */}
      {approvalModal.open && (
        <DirectorApprovalModal
          voucher={approvalModal.voucher}
          actionType={approvalModal.action}
          directorDefaultSignature={user?.signatureUrl}
          onClose={() => setApprovalModal({ open: false, voucher: null, action: 'approve' })}
          onSuccess={handleApprovalSuccess}
        />
      )}
    </div>
  );
};

export default DashboardPage;
