import { useState } from 'react';
import { applicationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiX, FiUpload } from 'react-icons/fi';

export default function ApplyModal({ job, onClose }) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [cvSource, setCvSource] = useState('existing'); // 'existing' or 'upload'
  const [selectedCV, setSelectedCV] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const cvList = user?.profile?.cv_url || [];

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');

    if (cvSource === 'existing' && !selectedCV) {
      setError('Vui lòng chọn một CV!');
      return;
    }
    if (cvSource === 'upload' && !selectedFile) {
      setError('Vui lòng chọn file CV để tải lên!');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('job_id', job.id);
      if (coverLetter) formData.append('cover_letter', coverLetter);

      if (cvSource === 'existing') {
        formData.append('custom_cv_url', selectedCV);
      } else {
        formData.append('cv', selectedFile);
      }

      await applicationAPI.apply(formData);
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

            <div className="form-group">
              <label>Phương thức nộp CV</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cvSource"
                    value="existing"
                    checked={cvSource === 'existing'}
                    onChange={() => setCvSource('existing')}
                  />
                  <span>Dùng CV đã có</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cvSource"
                    value="upload"
                    checked={cvSource === 'upload'}
                    onChange={() => setCvSource('upload')}
                  />
                  <span>Tải lên CV mới</span>
                </label>
              </div>
            </div>

            {cvSource === 'existing' ? (
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
                      {cv.name || `CV ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Tải lên CV mới (PDF)</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="form-input"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    <FiUpload className="inline mr-1" /> Chấp nhận file PDF tối đa 10MB
                  </p>
                </div>
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
