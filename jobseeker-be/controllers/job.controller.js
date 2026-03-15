const supabase = require("../config/connectDB");
const AccountStatus = require("../constraints/accountStatus");
const JobStatus = require("../constraints/jobStatus");
const JobType = require("../constraints/jobType");
const { serverErrorMessageRes } = require("../helpers/serverErrorMessage");

// POST /job — recruiter posts a new job vacancy
const postJob = async (req, res) => {
  try {
    const { userId } = req;
    const user = await supabase
      .from("User")
      .select("*")
      .eq("id", userId)
      .single();
    if (user.error) return serverErrorMessageRes(res, user.error);
    if (user.data.status !== AccountStatus.ACTIVE) {
      return res.status(403).json({
        message: `Your current status is ${user.data.status}. You are not allowed to post a job`,
      });
    }

    const {
      title,
      description,
      location,
      position,
      salary_min,
      salary_max,
      job_type,
      ended_at,
      requirement,
      benefit,
      recruite_quantity,
      exp_year,
      category_ids = [],
    } = req.body;

    if (!title || !description || !job_type || !ended_at) {
      return res.status(400).json({
        success: false,
        message: "title, description, job_type, and ended_at are required!",
      });
    }

    if (!Object.values(JobType).includes(job_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid job_type. Allowed values: ${Object.values(JobType).join(", ")}`,
      });
    }

    const { data: job, error: jobError } = await supabase
      .from("job")
      .insert({
        recruiter_id: req.userId,
        title,
        description,
        location,
        position,
        salary_min,
        salary_max,
        job_type,
        ended_at,
        requirement,
        benefit,
        recruite_quantity,
        exp_year,
      })
      .select()
      .single();

    if (jobError) return serverErrorMessageRes(res, jobError);

    // Insert categories into junction table
    if (category_ids.length > 0) {
      const categoryRows = category_ids.map((category_id) => ({
        job_id: job.id,
        category_id,
      }));
      const { error: catError } = await supabase
        .from("jobhascategory")
        .insert(categoryRows);
      if (catError) return serverErrorMessageRes(res, catError);
    }

    return res.status(201).json({
      success: true,
      message: "Job posted successfully!",
      data: job,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

// GET /job — public list of jobs with optional filters + pagination
const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      recordPerPage = 10,
      keyword,
      location,
      job_type,
      status = JobStatus.OPEN,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.max(parseInt(recordPerPage, 10) || 10, 1);
    const from = (pageNumber - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from("job")
      .select(
        "id, title, description, location, position, salary_min, salary_max, job_type, status, created_at, ended_at, requirement, benefit, recruite_quantity, exp_year, recruiter_id",
        { count: "exact" },
      );

    if (status) query = query.eq("status", status);
    if (location) query = query.ilike("location", `%${location}%`);
    if (job_type) query = query.eq("job_type", job_type);
    if (keyword)
      query = query.or(
        `title.ilike.%${keyword}%,description.ilike.%${keyword}%`,
      );

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return serverErrorMessageRes(res, error);

    const totalPages = Math.ceil((count || 0) / perPage);

    return res.status(200).json({
      success: true,
      totalRecords: count,
      totalPages,
      currentPage: pageNumber,
      data,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

// GET /job/:id — single job detail with categories
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: job, error } = await supabase
      .from("job")
      .select("*, User(recruiterprofile(company_name, location, website))")
      .eq("id", id)
      .single();

    if (error || !job) {
      return res
        .status(404)
        .json({ success: false, message: `Job not found!` });
    }

    // Fetch categories via junction table
    const { data: categories } = await supabase
      .from("jobhascategory")
      .select("jobcategory(id, name, description)")
      .eq("job_id", id);

    return res.status(200).json({
      success: true,
      data: {
        ...job,
        categories: (categories || []).map((c) => c.jobcategory),
      },
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

// GET /job/:id/applicants — recruiter views applicants for their own job
const getApplicants = async (req, res) => {
  try {
    const { id: jobId } = req.params;

    // Verify the job belongs to the requesting recruiter
    const { data: job, error: jobError } = await supabase
      .from("job")
      .select("id, recruiter_id, title")
      .eq("id", jobId)
      .maybeSingle();

    if (jobError) return serverErrorMessageRes(res, jobError);

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found!" });
    }

    if (job.recruiter_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view applicants for this job!",
      });
    }

    const { data: applications, error: appError } = await supabase
      .from("application")
      .select("id, custom_cv_url, cover_letter, status, applied_at, seeker_id")
      .eq("job_id", jobId)
      .order("applied_at", { ascending: false });

    if (appError) return serverErrorMessageRes(res, appError);

    const { data: seeker, error: seekerError } = await supabase
      .from("User")
      .select("*, seekerprofile(*)")
      .in(
        "id",
        applications.map((app) => app.seeker_id),
      );

    if (seekerError) return serverErrorMessageRes(res, seekerError);

    return res.status(200).json({
      success: true,
      job_title: job.title,
      total: applications.length,
      data: applications.map((app) => ({
        ...app,
        seeker: seeker.find((s) => s.id === app.seeker_id),
      })),
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

// GET /job/recruiter/my-jobs — recruiter views their own jobs
const getRecruiterJobs = async (req, res) => {
  try {
    const { page = 1, recordPerPage = 10, status } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.max(parseInt(recordPerPage, 10) || 10, 1);
    const from = (pageNumber - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from("job")
      .select("*", { count: "exact" })
      .eq("recruiter_id", req.userId);

    if (status) query = query.eq("status", status);

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return serverErrorMessageRes(res, error);

    const totalPages = Math.ceil((count || 0) / perPage);

    return res.status(200).json({
      success: true,
      totalRecords: count,
      totalPages,
      currentPage: pageNumber,
      data,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

module.exports = {
  postJob,
  getJobs,
  getJobById,
  getApplicants,
  getRecruiterJobs,
};
