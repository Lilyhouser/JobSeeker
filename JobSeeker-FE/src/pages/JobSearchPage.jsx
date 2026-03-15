import { useState, useEffect } from "react";
import { jobAPI } from "../services/api";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiBookmark,
} from "react-icons/fi";

export default function JobSearchPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [keyword, setKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobType, setJobType] = useState("");

  const fetchJobs = async (
    page = 1,
    typeOverride,
    keywordOverride,
    locationOverride,
  ) => {
    setLoading(true);
    try {
      // Use the overrides if provided (to handle async state updates), otherwise use current state
      const activeJobType = typeOverride !== undefined ? typeOverride : jobType;
      const activeKeyword =
        keywordOverride !== undefined ? keywordOverride : keyword;
      const activeLocation =
        locationOverride !== undefined ? locationOverride : locationFilter;

      const params = {
        page,
        recordPerPage: 10,
        keyword: activeKeyword,
        location: activeLocation,
        job_type: activeJobType,
      };

      // Remove empty parameters
      Object.keys(params).forEach(
        (key) =>
          (params[key] === "" || params[key] === undefined) &&
          delete params[key],
      );

      const res = await jobAPI.getJobs(params);
      setJobs(res.data.data || []);
      setTotalRecords(res.data.totalRecords || 0);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handleFilterChange = (type) => {
    setJobType(type);
    fetchJobs(1, type);
  };

  const handleReset = () => {
    setKeyword("");
    setLocationFilter("");
    setJobType("");
    fetchJobs(1, "", "", "");
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Thỏa thuận";
    if (min && max) return `$${min} - $${max}`;
    if (min) return `Từ $${min}`;
    return `Đến $${max}`;
  };

  const formatJobType = (type) => {
    const map = {
      full_time: "Toàn thời gian",
      part_time: "Bán thời gian",
      remote: "Từ xa",
    };
    return map[type] || type;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div className="page-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <FiFilter />
          <span>Bộ lọc</span>
        </div>

        <form onSubmit={handleSearch} className="sidebar-search">
          <div className="input-icon">
            <FiSearch />
            <input
              id="search-keyword"
              type="text"
              placeholder="Từ khóa..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Tìm kiếm
          </button>
        </form>

        <div className="filter-section">
          <h4>Địa điểm</h4>
          <div className="input-icon">
            <FiMapPin />
            <input
              id="filter-location"
              type="text"
              placeholder="VD: Hồ Chí Minh"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <h4>Loại hình</h4>
          <div className="filter-chips">
            {[
              { value: "", label: "Tất cả" },
              { value: "full_time", label: "Toàn thời gian" },
              { value: "part_time", label: "Bán thời gian" },
              { value: "remote", label: "Từ xa" },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`chip ${jobType === opt.value ? "active" : ""}`}
                onClick={() => handleFilterChange(opt.value)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={() => fetchJobs(1)}
        >
          Áp dụng bộ lọc
        </button>

        <button
          className="btn btn-outline btn-full"
          onClick={handleReset}
          style={{ marginTop: "12px", color: "white" }}
          type="button"
        >
          Xóa bộ lọc
        </button>
      </aside>

      <main className="main-content">
        <div className="content-header">
          <h1>Tìm thấy {totalRecords} công việc</h1>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <p>Không tìm thấy công việc nào.</p>
          </div>
        ) : (
          <div className="job-list">
            {jobs.map((job) => (
              <Link to={`/jobs/${job.id}`} key={job.id} className="job-card">
                <div className="job-card-top">
                  <div className="job-card-info">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-position">{job.position || "N/A"}</p>
                  </div>
                  <button
                    className="bookmark-btn"
                    onClick={(e) => e.preventDefault()}
                  >
                    <FiBookmark />
                  </button>
                </div>
                <div className="job-meta">
                  <span className="meta-item">
                    <FiMapPin /> {job.location || "Không xác định"}
                  </span>
                  <span className="meta-item">
                    <FiDollarSign />{" "}
                    {formatSalary(job.salary_min, job.salary_max)}
                  </span>
                  <span className="meta-item">
                    <FiClock /> {formatJobType(job.job_type)}
                  </span>
                </div>
                <p className="job-description-preview">
                  {job.description?.substring(0, 150)}...
                </p>
                <div className="job-card-footer">
                  <div className="job-tags">
                    <span className="tag">{formatJobType(job.job_type)}</span>
                    {job.exp_year && (
                      <span className="tag">EXP: {job.exp_year} năm</span>
                    )}
                  </div>
                  <span className="job-date">{formatDate(job.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

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
              Trang {currentPage} / {totalPages}
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
      </main>
    </div>
  );
}
