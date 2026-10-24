import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, FolderOpen, IndianRupee, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar no-print">
      <div className="container">
        <div className="navbar-inner">
          {/* Indian Brand Logo */}
          <NavLink to="/dashboard" className="brand-logo">
            <div className="brand-icon-box" style={{ background: 'linear-gradient(135deg, #047857, #10b981)' }}>
              <IndianRupee size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--slate-900)', lineHeight: 1.1 }}>
                Bharat Tech Solutions
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                Employee Expense Voucher System
              </div>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav>
            <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/vouchers"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <FolderOpen size={18} />
                  <span>All Vouchers</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/create"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <PlusCircle size={18} />
                  <span>+ Add Voucher</span>
                </NavLink>
              </li>

              {/* User Profile Pill & Logout */}
              {user && (
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <User size={15} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--slate-800)', lineHeight: 1.1 }}>{user.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'capitalize' }}>{user.role}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--slate-600)', padding: '0.35rem 0.6rem' }}
                    title="Log Out"
                  >
                    <LogOut size={16} />
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
