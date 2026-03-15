import { useState } from 'react';
import { applicationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiX, FiFileText } from 'react-icons/fi';

export default function ApplyModal({ job, onClose }) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedCV, setSelectedCV] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const cvList = user?.profile?.cv_url || [];

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await applicationAPI.apply({
        job_id: job.id,
        custom_cv_url: selectedCV || undefined,
        cover_letter: coverLetter || undefined,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Ứng tuyển thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ứng tuyển vị trí {job.title}</h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        {success ? (
          <div className="modal-body">
            <div className="alert alert-success">Ứng tuyển thành công!</div>
          </div>
        ) : (
          <form onSubmit={handleApply} className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            {cvList.length > 0 && (
              <div className="form-group">
                <label>Chọn CV đã tải lên</label>
                <select
                  id="apply-cv-select"
                  value={selectedCV}
                  onChange={(e) => setSelectedCV(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Chọn CV --</option>
                  {cvList.map((cv, idx) => (
                    <option key={idx} value={cv.url}>
                      <FiFileText /> {cv.name || `CV ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Thư giới thiệu (Cover Letter)</label>
              <textarea
                id="apply-cover-letter"
                rows={5}
                placeholder="Viết thư giới thiệu bản thân..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Ứng tuyển'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
