import { useState, useEffect } from 'react';
import { jobAPI, categoryAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';

export default function PostJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    position: '',
    salary_min: '',
    salary_max: '',
    job_type: 'full_time',
    ended_at: '',
    requirement: '',
    benefit: '',
    recruite_quantity: '',
    exp_year: '',
    category_ids: [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getAll();
        setCategories(res.data.data || []);
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCategoryToggle = (catId) => {
    setForm((prev) => {
      const exists = prev.category_ids.includes(catId);
      return {
        ...prev,
        category_ids: exists
          ? prev.category_ids.filter((id) => id !== catId)
          : [...prev.category_ids, catId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        recruite_quantity: form.recruite_quantity ? Number(form.recruite_quantity) : undefined,
        exp_year: form.exp_year ? Number(form.exp_year) : undefined,
      };
      await jobAPI.postJob(payload);
      setMessage({ type: 'success', text: 'Đăng công việc thành công!' });
      setTimeout(() => navigate('/recruiter/my-jobs'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi đăng tin!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-page">
        <h1>Đăng công việc</h1>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className="post-job-form">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tiêu đề công việc *</label>
                <input
                  id="job-title"
                  type="text"
                  value={form.title}
                  onChange={handleChange('title')}
                  placeholder="Fullstack Developer"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Loại công việc *</label>
                <select
                  id="job-type"
                  value={form.job_type}
                  onChange={handleChange('job_type')}
                  className="form-select"
                  required
                >
                  <option value="full_time">Toàn thời gian</option>
                  <option value="part_time">Bán thời gian</option>
                  <option value="remote">Từ xa</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Vị trí</label>
                <input
                  id="job-position"
                  type="text"
                  value={form.position}
                  onChange={handleChange('position')}
                  placeholder="Frontend Developer"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Hạn nộp *</label>
                <input
                  id="job-ended-at"
                  type="date"
                  value={form.ended_at}
                  onChange={handleChange('ended_at')}
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin thêm</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Địa điểm</label>
                <input
                  id="job-location"
                  type="text"
                  value={form.location}
                  onChange={handleChange('location')}
                  placeholder="Hồ Chí Minh"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Mức lương</label>
                <div className="salary-range">
                  <input
                    id="job-salary-min"
                    type="number"
                    value={form.salary_min}
                    onChange={handleChange('salary_min')}
                    placeholder="10"
                    className="form-input"
                  />
                  <span>-</span>
                  <input
                    id="job-salary-max"
                    type="number"
                    value={form.salary_max}
                    onChange={handleChange('salary_max')}
                    placeholder="15 triệu/tháng"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số lượng tuyển</label>
                <input
                  id="job-quantity"
                  type="number"
                  value={form.recruite_quantity}
                  onChange={handleChange('recruite_quantity')}
                  placeholder="3"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Kinh nghiệm (năm)</label>
                <input
                  id="job-exp"
                  type="number"
                  value={form.exp_year}
                  onChange={handleChange('exp_year')}
                  placeholder="2"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Mô tả chi tiết</h3>
            <div className="form-group">
              <label>Mô tả công việc *</label>
              <textarea
                id="job-description"
                rows={5}
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Mô tả chi tiết về công việc..."
                required
                className="form-textarea"
              />
            </div>
            <div className="form-group">
              <label>Yêu cầu</label>
              <textarea
                id="job-requirement"
                rows={4}
                value={form.requirement}
                onChange={handleChange('requirement')}
                placeholder="Yêu cầu ứng viên..."
                className="form-textarea"
              />
            </div>
            <div className="form-group">
              <label>Quyền lợi</label>
              <textarea
                id="job-benefit"
                rows={4}
                value={form.benefit}
                onChange={handleChange('benefit')}
                placeholder="Quyền lợi cho ứng viên..."
                className="form-textarea"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div className="form-section">
              <h3>Danh mục</h3>
              <div className="category-chips">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`chip ${form.category_ids.includes(cat.id) ? 'active' : ''}`}
                    onClick={() => handleCategoryToggle(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <FiSend /> {loading ? 'Đang đăng...' : 'Đăng công việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
