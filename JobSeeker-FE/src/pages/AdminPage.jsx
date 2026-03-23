import { useState, useEffect } from "react";
import { userAPI } from "../services/api";
import { FiCheck, FiX, FiEye, FiExternalLink } from "react-icons/fi";

export default function AdminPage() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getPendingRecruiters();
      setRecruiters(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const handleApprove = async (id) => {
    try {
      await userAPI.approveRecruiter(id);
      fetchRecruiters();
      setSelectedRecruiter(null);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");

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
                <th>Tên công ty</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Ngày đăng ký</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {recruiters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    Không có recruiter nào chờ duyệt
                  </td>
                </tr>
              ) : (
                recruiters.map((rec, idx) => (
                  <tr key={rec.id}>
                    <td>{idx + 1}</td>
                    <td className="td-title">
                      {rec.profile?.company_name || "N/A"}
                    </td>
                    <td>{rec.email}</td>
                    <td>{rec.profile?.location || "-"}</td>
                    <td>
                      <span className="status-badge badge-warning">
                        {rec.status}
                      </span>
                    </td>
                    <td>{formatDate(rec.created_at)}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setSelectedRecruiter(rec)}
                        >
                          <FiEye /> Chi tiết
                        </button>
                        <button
                          className="btn btn-sm btn-success-outline"
                          onClick={() => handleApprove(rec.id)}
                        >
                          <FiCheck /> Phê duyệt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecruiter && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedRecruiter(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết nhà tuyển dụng</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedRecruiter(null)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Công ty</label>
                  <p>{selectedRecruiter.profile?.company_name || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Đại chỉ</label>
                  <p>{selectedRecruiter.profile?.location || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <p>{selectedRecruiter.email}</p>
                </div>
                <div className="detail-item">
                  <label>Mã số thuế</label>
                  <p>{selectedRecruiter.profile?.tax_code || "N/A"}</p>
                </div>
                <div className="detail-item full-width">
                  <label>Giấy phép kinh doanh</label>
                  {selectedRecruiter.profile?.bussiness_license_url ? (
                    <a
                      href={selectedRecruiter.profile.bussiness_license_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                    >
                      <FiExternalLink /> Xem giấy phép
                    </a>
                  ) : (
                    <p>Chưa tải lên</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setSelectedRecruiter(null)}
                >
                  Từ chối
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => alert("Thêm thông tin sẽ làm sau")}
                >
                  Thêm thông in
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleApprove(selectedRecruiter.id)}
                >
                  <FiCheck /> Phê duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
