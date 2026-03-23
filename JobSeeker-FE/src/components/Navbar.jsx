import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case 'seeker':
        return [
          { to: '/jobs', label: 'Tìm việc' },
          { to: '/my-applications', label: 'Đơn ứng tuyển' },
        ];
      case 'recruiter':
        return [
          { to: '/recruiter/my-jobs', label: 'Quản lý tuyển dụng' },
          { to: '/recruiter/post-job', label: 'Đăng công việc' },
        ];
      case 'admin':
        return [
          { to: '/admin', label: 'Quản lý tuyển dụng' },
          { to: '/admin/reports', label: 'Báo cáo vi phạm' },
        ];
      default:
        return [];
    }
  };

  const getDisplayName = () => {
    if (!user) return '';
    if (user.profile?.fullname) return user.profile.fullname;
    if (user.profile?.company_name) return user.profile.company_name;
    return user.email;
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span>JOBSEEKER</span>
        </Link>

        <div className="navbar-links">
          {getNavLinks().map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-menu-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="avatar-small">
                  <FiUser />
                </div>
                <span className="user-name">{getDisplayName()}</span>
                <FiChevronDown className={`chevron ${dropdownOpen ? 'open' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link
                    to={user.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FiUser /> Hồ sơ cá nhân
                  </Link>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <FiLogOut /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
