import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userAPI } from "../services/api";
import {
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiFileText,
  FiSave,
} from "react-icons/fi";

export default function RecruiterProfilePage() {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [businessLicense, setBusinessLicense] = useState(null);

  useEffect(() => {
    if (user?.profile) {
      setCompanyName(user.profile.company_name || "");
      setLocation(user.profile.location || "");
      setTaxCode(user.profile.tax_code || "");
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const formData = new FormData();
      formData.append("company_name", companyName);
      formData.append("location", location);
      formData.append("tax_code", taxCode);
      if (businessLicense) {
        formData.append("bussiness_license", businessLicense);
      }

      await userAPI.updateRecruiterProfile(formData);
      await fetchUser();
      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
      setBusinessLicense(null); // Clear the file after success
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Lỗi cập nhật!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="profile-page">
        <div className="profile-sidebar-card">
          <div className="avatar-large">
            <FiBriefcase size={40} />
          </div>
          <h3>{companyName || "Công ty chưa cập nhật"}</h3>
          <p className="text-muted">{user?.email}</p>

          <div className="cv-section">
            {user?.profile?.bussiness_license_url ? (
              <a
                href={user.profile.bussiness_license_url}
                target="_blank"
                rel="noopener noreferrer"
                className="cv-link-card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                <h4
                  style={{ color: "var(--color-accent)", marginBottom: "4px" }}
                >
                  <FiFileText /> Giấy phép kinh doanh
                </h4>
                <p className="text-muted">Nhấp để xem giấy phép hiện tại</p>
              </a>
            ) : (
              <>
                <h4>
                  <FiFileText /> Giấy phép kinh doanh
                </h4>
                <p className="text-muted">Chưa cập nhật giấy phép</p>
              </>
            )}
          </div>
        </div>

        <div className="profile-form-card">
          <h2>Thông tin nhà tuyển dụng</h2>

          {message.text && (
            <div className={`alert alert-${message.type}`}>{message.text}</div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="form-row">
              <div className="form-group">
                <label>Tên công ty</label>
                <div className="input-icon">
                  <FiBriefcase />
                  <input
                    id="profile-company-name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Tên công ty"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Mã số thuế</label>
                <div className="input-icon">
                  <FiFileText />
                  <input
                    id="profile-tax-code"
                    type="text"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder="Mã số thuế"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email liên hệ</label>
                <div className="input-icon">
                  <FiMail />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="input-disabled"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <div className="input-icon">
                  <FiMapPin />
                  <input
                    id="profile-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Địa chỉ công ty"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Cập nhật Giấy phép kinh doanh (PDF hoặc Image)</label>
              <div className="file-upload">
                <input
                  id="profile-license"
                  type="file"
                  onChange={(e) => setBusinessLicense(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <span className="file-upload-text">
                  {businessLicense
                    ? businessLicense.name
                    : "Chọn tệp mới để thay thế giấy phép hiện tại"}
                </span>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <FiSave /> {loading ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
