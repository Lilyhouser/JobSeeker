import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-hex">
              <svg viewBox="0 0 60 60" fill="none">
                <polygon points="30,2 55,17 55,43 30,58 5,43 5,17" stroke="currentColor" strokeWidth="2" fill="none"/>
                <text x="30" y="35" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">JS</text>
              </svg>
            </div>
            <h2>JOBSEEKER</h2>
          </div>
        </div>

        <div className="auth-tabs">
          <button className="auth-tab active">Đăng nhập</button>
          <Link to="/register" className="auth-tab">Đăng ký</Link>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <div className="input-icon">
              <FiMail />
              <input
                id="login-email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-icon">
              <FiLock />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <p className="auth-footer-text">
            Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
