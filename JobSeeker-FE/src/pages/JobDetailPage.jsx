import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ApplyModal from '../components/ApplyModal';
import { FiMapPin, FiClock, FiDollarSign, FiUsers, FiBriefcase, FiCalendar } from 'react-icons/fi';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobAPI.getJobById(id);
        setJob(res.data.data);
      } catch (err) {
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Thỏa thuận';
    if (min && max) return `$${min} - $${max}`;
    if (min) return `Từ $${min}`;
    return `Đến $${max}`;
  };

  const formatJobType = (type) => {
    const map = { full_time: 'Toàn thời gian', part_time: 'Bán thời gian', remote: 'Từ xa' };
    return map[type] || type;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Không tìm thấy công việc</h2>
        </div>
      </div>
    );
  }

  const company = job.User?.recruiterprofile?.[0] || {};

  return (
    <div className="page-container">
      <div className="job-detail">
        <div className="job-detail-header">
          <div className="job-detail-title-block">
            <h1>{job.title}</h1>
            <p className="company-name">{company.company_name || 'Công ty'}</p>
          </div>
          <div className="job-detail-meta-badges">
            <span className="badge"><FiMapPin /> {job.location || 'N/A'}</span>
            <span className="badge"><FiDollarSign /> {formatSalary(job.salary_min, job.salary_max)}</span>
            <span className="badge"><FiClock /> {formatJobType(job.job_type)}</span>
            {job.recruite_quantity && (
              <span className="badge"><FiUsers /> {job.recruite_quantity} ứng viên</span>
            )}
            {job.exp_year && (
              <span className="badge"><FiBriefcase /> {job.exp_year} năm KN</span>
            )}
            <span className="badge"><FiCalendar /> Hết hạn: {formatDate(job.ended_at)}</span>
          </div>
        </div>

        <div className="job-detail-body">
          <section className="detail-section">
            <h2>Mô tả công việc</h2>
            <div className="detail-content">
              {job.description?.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </section>

          {job.requirement && (
            <section className="detail-section">
              <h2>Yêu cầu công việc</h2>
              <div className="detail-content">
                {job.requirement.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </section>
          )}

          {job.benefit && (
            <section className="detail-section">
              <h2>Quyền lợi</h2>
              <div className="detail-content">
                {job.benefit.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </section>
          )}

          {job.categories?.length > 0 && (
            <section className="detail-section">
              <h2>Danh mục</h2>
              <div className="job-tags">
                {job.categories.map((cat) => (
                  <span key={cat.id} className="tag">{cat.name}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {user?.role === 'seeker' && (
          <div className="job-detail-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowApplyModal(true)}
            >
              Ứng tuyển ngay
            </button>
          </div>
        )}
      </div>

      {showApplyModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowApplyModal(false)}
        />
      )}
    </div>
  );
}
