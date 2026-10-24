import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import VoucherTable from '../components/VoucherTable';
import { PlusCircle, Search, IndianRupee, FileText, Clock, CheckCircle2 } from 'lucide-react';

const VoucherListPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const url = search.trim() ? `/vouchers?search=${encodeURIComponent(search.trim())}` : '/vouchers';
      const res = await api.get(url);
      if (res.data.success) {
        setVouchers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load vouchers:', err);
      setError(err.response?.data?.message || 'Error fetching vouchers from database');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVouchers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchVouchers]);

  const handleDelete = async (id, voucherNumber) => {
    const vText = voucherNumber ? `voucher ${voucherNumber}` : 'this voucher';
    if (!window.confirm(`Are you sure you want to permanently delete ${vText} from MongoDB?`)) {
      return;
    }

    try {
      const res = await api.delete(`/vouchers/${id}`);
      if (res.data.success) {
        setVouchers((prev) => prev.filter((v) => v._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete voucher');
    }
  };

  // Quick stats calculations
  const totalAmount = vouchers.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  const pendingCount = vouchers.filter((v) => ['Pending', 'Draft', 'Submitted'].includes(v.status)).length;
  const approvedCount = vouchers.filter((v) => ['Approved', 'Paid'].includes(v.status)).length;

  return (
    <div className="container">
      {/* Page Header */}
      <div className="flex-between" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Employee Expense Vouchers</h1>
          <p style={{ color: 'var(--slate-600)' }}>
            Bharat Tech Solutions Pvt. Ltd. — Centralized reimbursement records stored in MongoDB.
          </p>
        </div>

        <Link to="/create" className="btn btn-primary">
          <PlusCircle size={18} /> + Add New Voucher
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Vouchers</span>
            <span className="stat-value">{vouchers.length}</span>
          </div>
          <div className="stat-icon stat-blue">
            <FileText size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Claim Amount</span>
            <span className="stat-value" style={{ fontSize: '1.5rem' }}>
              ₹ {totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="stat-icon stat-green">
            <IndianRupee size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Pending Review</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
          <div className="stat-icon stat-amber">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Approved & Settled</span>
            <span className="stat-value">{approvedCount}</span>
          </div>
          <div className="stat-icon stat-slate">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="filter-toolbar" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by Employee Name (Yashi, Sakshi, Varad...), Title, Department, or Voucher #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Voucher Table */}
      <VoucherTable vouchers={vouchers} onDelete={handleDelete} loading={loading} />
    </div>
  );
};

export default VoucherListPage;
