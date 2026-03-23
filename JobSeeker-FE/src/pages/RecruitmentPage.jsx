import { useState, useEffect } from "react";
import { jobAPI, applicationAPI } from "../services/api";
import { FiUsers, FiFileText, FiX, FiCheck, FiClock } from "react-icons/fi";

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await jobAPI.getMyJobs({ page, recordPerPage: 10 });
      setJobs(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setLoadingApplicants(true);
    try {
      const res = await jobAPI.getApplicants(job.id);
      setApplicants(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      await applicationAPI.updateStatus(appId, status);
      // Refresh applicants
      if (selectedJob) {
        const res = await jobAPI.getApplicants(selectedJob.id);
        setApplicants(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");
  const formatJobType = (type) => {
    const map = {
      full_time: "Toàn thời gian",
      part_time: "Bán thời gian",
      remote: "Từ xa",
    };
    return map[type] || type;
  };

  const getStatusBadge = (status) => {
    const map = {
      open: { label: "Đang mở", cls: "badge-success" },
      closed: { label: "Đã đóng", cls: "badge-danger" },
      expired: { label: "Hết hạn", cls: "badge-warning" },
    };
    const s = map[status] || { label: status, cls: "" };
    return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
  };

  const getAppStatusBadge = (status) => {
    const map = {
      applied: { label: "Đã nộp", cls: "badge-info" },
      considering: { label: "Đang xem xét", cls: "badge-warning" },
      passed: { label: "Đã duyệt", cls: "badge-success" },
      rejected: { label: "Từ chối", cls: "badge-danger" },
    };
    const s = map[status] || { label: status, cls: "" };
    return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div className="page-container">
      <h1>Quản lý tuyển dụng</h1>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tiêu đề</th>
                <th>Loại hình</th>
                <th>Địa điểm</th>
                <th>Trạng thái</th>
                <th>Ngày đăng</th>
                <th>Hạn nộp</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">
                    Chưa có công việc nào
                  </td>
                </tr>
              ) : (
                jobs.map((job, idx) => (
                  <tr key={job.id}>
                    <td>{(currentPage - 1) * 10 + idx + 1}</td>
                    <td className="td-title">{job.title}</td>
                    <td>{formatJobType(job.job_type)}</td>
                    <td>{job.location || "-"}</td>
                    <td>{getStatusBadge(job.status)}</td>
                    <td>{formatDate(job.created_at)}</td>
                    <td>{formatDate(job.ended_at)}</td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleViewApplicants(job)}
                      >
                        <FiUsers /> Ứng viên
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage <= 1}
                onClick={() => fetchJobs(currentPage - 1)}
              >
                Trước
              </button>
              <span className="page-info">
                Trang {currentPage}/{totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => fetchJobs(currentPage + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}

      {/* Applicants Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ứng viên - {selectedJob.title}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedJob(null)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {loadingApplicants ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                </div>
              ) : applicants.length === 0 ? (
                <p className="text-center text-muted">Chưa có ứng viên nào.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ứng viên</th>
                      <th>Email</th>
                      <th>CV</th>
                      <th>Trạng thái</th>
                      <th>Ngày nộp</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((app, idx) => (
                      <tr key={app.id}>
                        <td>{idx + 1}</td>
                        <td>{app.seeker?.seekerprofile?.fullname || "N/A"}</td>
                        <td>{app.seeker?.email || "N/A"}</td>
                        <td>
                          {app.custom_cv_url ? (
                            <a
                              href={app.custom_cv_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link"
                            >
                              <FiFileText /> Xem CV
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>{getAppStatusBadge(app.status)}</td>
                        <td>{formatDate(app.applied_at)}</td>
                        <td>
                          {app.status !== "passed" &&
                          app.status !== "rejected" ? (
                            <div className="action-btns">
                              <button
                                className="btn btn-sm btn-success-outline"
                                onClick={() =>
                                  handleUpdateStatus(app.id, "considering")
                                }
                                title="Xem xét"
                              >
                                <FiClock />
                              </button>
                              <button
                                className="btn btn-sm btn-success-outline"
                                onClick={() =>
                                  handleUpdateStatus(app.id, "passed")
                                }
                                title="Duyệt"
                              >
                                <FiCheck />
                              </button>
                              <button
                                className="btn btn-sm btn-danger-outline"
                                onClick={() =>
                                  handleUpdateStatus(app.id, "rejected")
                                }
                                title="Từ chối"
                              >
                                <FiX />
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
