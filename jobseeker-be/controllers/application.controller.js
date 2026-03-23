const supabase = require("../config/connectDB");
const ApplicationStatus = require("../constraints/applicationStatus");
const JobStatus = require("../constraints/jobStatus");
const { serverErrorMessageRes } = require("../helpers/serverErrorMessage");

// POST /application — seeker applies for a job
const applyForJob = async (req, res) => {
  try {
    const { job_id, custom_cv_url: body_cv_url, cover_letter } = req.body;
    let final_cv_url = body_cv_url;

    if (!job_id) {
      return res
        .status(400)
        .json({ success: false, message: "job_id is required!" });
    }

    // Handle file upload if present
    if (req.file) {
      const { originalname, buffer, mimetype } = req.file;
      const timestamp = Date.now();
      const filePath = `applications/${req.userId}/${timestamp}_${originalname}`;

      // Upload to Supabase Storage bucket "cvs"
      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(filePath, buffer, { contentType: mimetype, upsert: false });

      if (uploadError) return serverErrorMessageRes(res, uploadError);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("cvs")
        .getPublicUrl(filePath);

      final_cv_url = urlData.publicUrl;
    }

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from("job")
      .select("id, status, ended_at")
      .eq("id", job_id)
      .maybeSingle();

    if (jobError) return serverErrorMessageRes(res, jobError);

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found!" });
    }

    if (job.status !== JobStatus.OPEN) {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications!",
      });
    }

    // Check for duplicate application
    const { data: existing } = await supabase
      .from("application")
      .select("id")
      .eq("job_id", job_id)
      .eq("seeker_id", req.userId)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job!",
      });
    }

    const { data, error: insertError } = await supabase
      .from("application")
      .insert({
        job_id,
        seeker_id: req.userId,
        custom_cv_url: final_cv_url ?? null,
        cover_letter: cover_letter ?? null,
        status: ApplicationStatus.APPLIED,
      })
      .select()
      .single();

    if (insertError) return serverErrorMessageRes(res, insertError);

    return res.status(201).json({
      success: true,
      message: "Applied successfully!",
      data,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

// GET /application/me — seeker views all their applications
const getMyApplications = async (req, res) => {
  try {
    const { page = 1, recordPerPage = 10, status } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.max(parseInt(recordPerPage, 10) || 10, 1);
    const from = (pageNumber - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from("application")
      .select(
        "id, custom_cv_url, cover_letter, status, applied_at, job(id, title, location, salary_min, salary_max, job_type, status, ended_at, User(recruiterprofile(company_name, website)))",
        { count: "exact" },
      )
      .eq("seeker_id", req.userId);

    if (status) query = query.eq("status", status);

    const { data, count, error } = await query
      .order("applied_at", { ascending: false })
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

// PUT /application/:id/status — recruiter updates application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(ApplicationStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${Object.values(ApplicationStatus).join(", ")}`,
      });
    }

    // Verify application existence and recruiter ownership via the job table
    const { data: application, error: appError } = await supabase
      .from("application")
      .select("id, job(recruiter_id)")
      .eq("id", id)
      .single();

    if (appError || !application) {
      return res.status(404).json({ success: false, message: "Application not found!" });
    }

    if (application.job.recruiter_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this application!",
      });
    }

    const { data, error: updateError } = await supabase
      .from("application")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (updateError) return serverErrorMessageRes(res, updateError);

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully!",
      data,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

module.exports = { applyForJob, getMyApplications, updateApplicationStatus };
