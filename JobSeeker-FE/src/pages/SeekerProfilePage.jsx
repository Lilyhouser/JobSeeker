import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, seekerAPI } from '../services/api';
import { FiUser, FiPhone, FiMail, FiMapPin, FiUpload, FiSave, FiFileText } from 'react-icons/fi';

export default function SeekerProfilePage() {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setFullname(user.profile.fullname || '');
      setPhone(user.profile.phone || '');
      setAddress(user.profile.address || '');
      setSkills(user.profile.skills?.join(', ') || '');
      setBio(user.profile.bio || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await userAPI.updateSeekerProfile({
        fullname,
        phone,
        address,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      await fetchUser();
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi cập nhật!' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Chỉ chấp nhận file PDF!' });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      await seekerAPI.uploadCV(formData);
      await fetchUser();
      setMessage({ type: 'success', text: 'Tải CV thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi tải CV!' });
    } finally {
      setLoading(false);
    }
  };

  const cvList = user?.profile?.cv_url || [];

  return (
    <div className="page-container">
      <div className="profile-page">
        <div className="profile-sidebar-card">
          <div className="avatar-large">
            <FiUser size={48} />
          </div>
          <h3>{fullname || 'Chưa cập nhật'}</h3>
          <p className="text-muted">{user?.email}</p>

          <div className="cv-section">
            <h4><FiFileText /> CV đã tải lên</h4>
            {cvList.length > 0 ? (
              <ul className="cv-list">
                {cvList.map((cv, idx) => (
                  <li key={idx}>
                    <a href={cv.url} target="_blank" rel="noopener noreferrer">
                      {cv.name || `CV ${idx + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Chưa có CV nào</p>
            )}
            <label className="btn btn-outline btn-sm upload-btn">
              <FiUpload /> Tải CV lên
              <input
                type="file"
                accept=".pdf"
                onChange={handleUploadCV}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div className="profile-form-card">
          <h2>Thông tin cá nhân</h2>

          {message.text && (
            <div className={`alert alert-${message.type}`}>{message.text}</div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="form-row">
              <div className="form-group">
                <label>Họ tên</label>
                <div className="input-icon">
                  <FiUser />
                  <input
                    id="profile-fullname"
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <div className="input-icon">
                  <FiPhone />
                  <input
                    id="profile-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
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
                    type="email"
                    value={user?.email || ''}
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
                    id="profile-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Hà Nội"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Kỹ năng (phân cách bằng dấu phẩy)</label>
              <input
                id="profile-skills"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="JavaScript, React, Node.js"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Giới thiệu</label>
              <textarea
                id="profile-bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Sinh viên năm 4, có đam mê với công nghệ và thành thạo..."
                className="form-textarea"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FiSave /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
