import { useState, useEffect } from "react";
import { applicationAPI } from "../services/api";
import { FiFileText } from "react-icons/fi";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApplications = async (page = 1) => {
    setLoading(true);
    try {
      const res = await applicationAPI.getMyApplications({
        page,
        recordPerPage: 10,
      });
      setApplications(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");
  const getStatusBadge = (status) => {
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
      <h1>Đơn ứng tuyển của tôi</h1>

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
                <th>Công việc</th>
                <th>Công ty</th>
                <th>Trạng thái</th>
                <th>Ngày nộp</th>
                <th>CV</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    Bạn chưa ứng tuyển công việc nào
                  </td>
                </tr>
              ) : (
                applications.map((app, idx) => (
                  <tr key={app.id}>
                    <td>{(currentPage - 1) * 10 + idx + 1}</td>
                    <td className="td-title">{app.job?.title || "N/A"}</td>
                    <td>
                      {app.job?.User?.recruiterprofile?.company_name || "N/A"}
                    </td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>{formatDate(app.applied_at)}</td>
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
                onClick={() => fetchApplications(currentPage - 1)}
              >
                Trước
              </button>
              <span className="page-info">
                Trang {currentPage}/{totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => fetchApplications(currentPage + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
