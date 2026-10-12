import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogIn, UserPlus, KeyRound, Mail, User, Shield, Building } from 'lucide-react';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const result = await register({
          name,
          email,
          password,
          role,
          employeeId,
          department,
        });
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message);
        }
      } else {
        const result = await login(email, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    const result = await login(demoEmail, demoPassword);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="brand-icon-box"
            style={{ width: '3.5rem', height: '3.5rem', margin: '0 auto 1rem', fontSize: '1.5rem' }}
          >
            <FileText size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--slate-900)' }}>ABC Company</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.925rem' }}>
            Expense Voucher Management System
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <div className="search-box">
                  <User size={18} className="search-icon" />
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">User Role <span className="required">*</span></label>
                <div className="search-box">
                  <Shield size={18} className="search-icon" />
                  <select
                    className="form-select"
                    style={{ paddingLeft: '2.4rem' }}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="employee">Employee</option>
                    <option value="director">Director (Admin)</option>
                    <option value="accounts">Accounts Team</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="EMP-1001"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <div className="search-box">
              <Mail size={18} className="search-icon" />
              <input
                type="email"
                required
                className="form-control"
                placeholder="name@abc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password <span className="required">*</span></label>
            <div className="search-box">
              <KeyRound size={18} className="search-icon" />
              <input
                type="password"
                required
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', height: '46px' }}
          >
            {loading ? (
              'Processing...'
            ) : isRegister ? (
              <>
                <UserPlus size={18} /> Register Account
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister
              ? 'Already registered? Return to Login'
              : 'Need a new account? Register here'}
          </button>
        </div>

        {/* Demo Fast Login Box */}
        <div className="demo-account-box">
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase', textAlign: 'center' }}>
            Quick Demo Accounts (1-Click Login)
          </div>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('employee@abc.com', 'Password123!')}
              title="Employee: Sarah Jenkins"
            >
              Employee
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('director@abc.com', 'Password123!')}
              title="Director: Marcus Vance"
            >
              Director
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('accounts@abc.com', 'Password123!')}
              title="Accounts Team: Elena Rostova"
            >
              Accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
