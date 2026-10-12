import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SearchFilterBar from '../components/SearchFilterBar';
import VoucherTable from '../components/VoucherTable';
import DirectorApprovalModal from '../components/DirectorApprovalModal';
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const VoucherListPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isPendingView = location.pathname.includes('/pending');

  const defaultFilters = {
    search: '',
    status: isPendingView ? 'Submitted' : 'All',
    department: 'All',
    category: 'All',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [vouchers, setVouchers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvalModal, setApprovalModal] = useState({ open: false, voucher: null, action: 'approve' });

  // Update status when switching between /pending and /vouchers
  useEffect(() => {
    if (isPendingView) {
      setFilters((prev) => ({ ...prev, status: 'Submitted', page: 1 }));
    } else {
      setFilters((prev) => ({ ...prev, status: 'All', page: 1 }));
    }
  }, [isPendingView]);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Build query string params
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.department && filters.department !== 'All') params.append('department', filters.department);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const res = await api.get(`/vouchers?${params.toString()}`);
      if (res.data.success) {
        setVouchers(res.data.data);
        setTotalCount(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load vouchers:', err);
      setError(err.response?.data?.message || 'Error fetching vouchers');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleDeleteDraft = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this draft voucher?')) return;

    try {
      const res = await api.delete(`/vouchers/${id}`);
      if (res.data.success) {
        fetchVouchers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete voucher');
    }
  };

  const handleSubmitDraft = async (voucher) => {
    if (!voucher.employeeSignature && !user?.signatureUrl) {
      alert('An employee signature is required before submitting. Please click Edit to upload your signature.');
      return;
    }

    try {
      const res = await api.post(`/vouchers/${voucher._id}/submit`, {
        employeeSignature: voucher.employeeSignature || user?.signatureUrl,
      });
      if (res.data.success) {
        fetchVouchers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit voucher');
    }
  };

  const handleOpenApproval = (voucher, action) => {
    setApprovalModal({ open: true, voucher, action });
  };

  const handleApprovalSuccess = () => {
    setApprovalModal({ open: false, voucher: null, action: 'approve' });
    fetchVouchers();
  };

  const getPageTitle = () => {
    if (user?.role === 'employee') return 'My Expense Vouchers';
    if (isPendingView) return 'Pending Approval Requests';
    return 'All Organization Vouchers';
  };

  const getPageSubtitle = () => {
    if (user?.role === 'employee')
      return 'View, track, and manage all expense reimbursement vouchers created by you.';
    if (isPendingView)
      return 'Action required: Review, sign approval, or reject submitted expense claims.';
    return 'Complete organization repository of all employee expense claims.';
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="flex-between" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{getPageTitle()}</h1>
          <p style={{ color: 'var(--slate-600)' }}>{getPageSubtitle()}</p>
        </div>

        {user?.role === 'employee' && (
          <Link to="/vouchers/create" className="btn btn-primary">
            <PlusCircle size={18} /> Create Voucher
          </Link>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Advanced Search, Filter & Sort toolbar */}
      <SearchFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Results Count & Active Summary */}
      <div className="flex-between" style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--slate-500)' }}>
        <div>
          Showing <strong>{vouchers.length}</strong> of <strong>{totalCount}</strong> vouchers
        </div>
      </div>

      {/* Voucher Table */}
      <VoucherTable
        vouchers={vouchers}
        currentRole={user?.role}
        loading={loading}
        onDelete={handleDeleteDraft}
        onSubmit={handleSubmitDraft}
        onOpenApproval={handleOpenApproval}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex-between" style={{ marginTop: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={filters.page <= 1 || loading}
            onClick={() => handlePageChange(filters.page - 1)}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)', fontWeight: 600 }}>
            Page {filters.page} of {totalPages}
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={filters.page >= totalPages || loading}
            onClick={() => handlePageChange(filters.page + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Director Approval Modal */}
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

export default VoucherListPage;
