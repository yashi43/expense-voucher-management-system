import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  PlusCircle,
  LayoutDashboard,
  Clock,
  LogOut,
  FolderOpen,
  UserCheck,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'director':
        return 'badge-role-director';
      case 'accounts':
        return 'badge-role-accounts';
      default:
        return 'badge-role-employee';
    }
  };

  return (
    <header className="navbar no-print">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <NavLink to="/dashboard" className="brand-logo">
            <div className="brand-icon-box">
              <FileText size={22} />
            </div>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>ABC</span>
              <span style={{ color: 'var(--slate-800)', marginLeft: '4px' }}>Vouchers</span>
            </div>
          </NavLink>

          {/* Navigation Links based on Role */}
          <nav>
            <ul className="nav-links">
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </NavLink>
              </li>

              {/* Employee Links */}
              {user?.role === 'employee' && (
                <>
                  <li>
                    <NavLink
                      to="/vouchers/create"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      <PlusCircle size={18} />
                      <span>Create Voucher</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/vouchers"
                      end
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      <FolderOpen size={18} />
                      <span>My Vouchers</span>
                    </NavLink>
                  </li>
                </>
              )}

              {/* Director Links */}
              {user?.role === 'director' && (
                <>
                  <li>
                    <NavLink
                      to="/vouchers/pending"
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      <Clock size={18} />
                      <span>Pending Approvals</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/vouchers"
                      end
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      <FolderOpen size={18} />
                      <span>All Vouchers</span>
                    </NavLink>
                  </li>
                </>
              )}

              {/* Accounts Links */}
              {user?.role === 'accounts' && (
                <li>
                  <NavLink
                    to="/vouchers"
                    end
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <FolderOpen size={18} />
                    <span>All Vouchers</span>
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="user-pill">
              <div className="avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserCheck size={16} />}
              </div>
              <div className="user-info-text">
                <span className="user-name">{user?.name}</span>
                <span className={`badge ${getRoleBadgeClass(user?.role)}`} style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Logout from application"
              style={{ color: 'var(--danger)', padding: '0.5rem' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
