import { useState } from "react";
import { authAPI } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiFileText,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("seeker");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Seeker fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Recruiter fields
  const [companyName, setCompanyName] = useState("");
  const [recEmail, setRecEmail] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [location, setLocation] = useState("");
  const [businessLicense, setBusinessLicense] = useState(null);
  const [recPassword, setRecPassword] = useState("");
  const [recConfirmPassword, setRecConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const isSeeker = activeTab === "seeker";
    const pwd = isSeeker ? password : recPassword;
    const confirmPwd = isSeeker ? confirmPassword : recConfirmPassword;

    if (pwd !== confirmPwd) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (isSeeker) {
        formData.append("email", email);
        formData.append("password", password);
        formData.append("role", "seeker");
        formData.append("name", name);
      } else {
        formData.append("email", recEmail);
        formData.append("password", recPassword);
        formData.append("role", "recruiter");
        formData.append("company_name", companyName);
        formData.append("tax_code", taxCode);
        formData.append("location", location);
        if (businessLicense) {
          formData.append("bussiness_license", businessLicense);
        }
      }

      await authAPI.register(formData);
      setSuccess("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-hex">
              <svg viewBox="0 0 60 60" fill="none">
                <polygon
                  points="30,2 55,17 55,43 30,58 5,43 5,17"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <text
                  x="30"
                  y="35"
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="10"
                  fontWeight="bold"
                >
                  JS
                </text>
              </svg>
            </div>
            <h2>JOBSEEKER</h2>
          </div>
        </div>

        <div className="auth-tabs">
          <Link to="/login" className="auth-tab">
            Đăng nhập
          </Link>
          <button className="auth-tab active">Đăng ký</button>
        </div>

        <div className="register-role-tabs">
          <button
            className={`role-tab ${activeTab === "seeker" ? "active" : ""}`}
            onClick={() => setActiveTab("seeker")}
          >
            Người ứng tuyển
          </button>
          <button
            className={`role-tab ${activeTab === "recruiter" ? "active" : ""}`}
            onClick={() => setActiveTab("recruiter")}
          >
            Người tuyển dụng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {activeTab === "seeker" ? (
            <>
              <div className="form-group">
                <label>Họ và tên</label>
                <div className="input-icon">
                  <FiUser />
                  <input
                    id="register-name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <div className="input-icon">
                  <FiMail />
                  <input
                    id="register-email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="input-icon">
                    <FiLock />
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu</label>
                  <div className="input-icon">
                    <FiLock />
                    <input
                      id="register-confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Công ty</label>
                  <div className="input-icon">
                    <FiBriefcase />
                    <input
                      id="register-company"
                      type="text"
                      placeholder="Tên công ty"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <div className="input-icon">
                    <FiMapPin />
                    <input
                      id="register-location"
                      type="text"
                      placeholder="Hà Nội"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-icon">
                    <FiMail />
                    <input
                      id="register-rec-email"
                      type="email"
                      placeholder="company@gmail.com"
                      value={recEmail}
                      onChange={(e) => setRecEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mã số thuế</label>
                  <div className="input-icon">
                    <FiFileText />
                    <input
                      id="register-tax"
                      type="text"
                      placeholder="0123456789"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Giấy phép kinh doanh</label>
                <div className="file-upload">
                  <input
                    id="register-license"
                    type="file"
                    onChange={(e) => setBusinessLicense(e.target.files[0])}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  <span className="file-upload-text">
                    {businessLicense
                      ? businessLicense.name
                      : "Chọn tệp để tải lên (image)"}
                  </span>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="input-icon">
                    <FiLock />
                    <input
                      id="register-rec-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={recPassword}
                      onChange={(e) => setRecPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu</label>
                  <div className="input-icon">
                    <FiLock />
                    <input
                      id="register-rec-confirm"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={recConfirmPassword}
                      onChange={(e) => setRecConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="form-check">
            <input type="checkbox" id="agree-terms" required />
            <label htmlFor="agree-terms">
              Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          <p className="auth-footer-text">
            Bạn đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
