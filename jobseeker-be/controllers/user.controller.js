const bcrypt = require("bcrypt");
const supabase = require("../config/connectDB");
const { serverErrorMessageRes } = require("../helpers/serverErrorMessage");
const AccountStatus = require("../constraints/accountStatus");
const ROLE = require("../constraints/role");

// GET /user/me — returns User row + their profile based on role
const getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("User")
      .select("id, email, role, status, created_at")
      .eq("id", req.userId)
      .single();

    if (error) return serverErrorMessageRes(res, error);

    let profile = null;
    if (user.role === "seeker") {
      const { data } = await supabase
        .from("seekerprofile")
        .select("*")
        .eq("user_id", req.userId)
        .maybeSingle();
      profile = data;
    } else if (user.role === "recruiter") {
      const { data } = await supabase
        .from("recruiterprofile")
        .select("*")
        .eq("user_id", req.userId)
        .maybeSingle();
      profile = data;
    }

    return res.status(200).json({ success: true, data: { ...user, profile } });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

// PUT /user/seeker-profile — upsert seekerprofile for the logged-in seeker
const updateSeekerProfile = async (req, res) => {
  try {
    const { fullname, phone, address, skills } = req.body;

    const { data, error } = await supabase
      .from("seekerprofile")
      .upsert(
        {
          user_id: req.userId,
          ...(fullname !== undefined && { fullname }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(skills !== undefined && { skills }),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) return serverErrorMessageRes(res, error);

    return res.status(200).json({
      success: true,
      message: "Seeker profile updated successfully!",
      data,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

// PUT /user/recruiter-profile — upsert recruiterprofile for the logged-in recruiter
const updateRecruiterProfile = async (req, res) => {
  try {
    const {
      company_name,
      website,
      tax_code,
      exp_years,
      location,
      supplement_info,
    } = req.body;

    let licenseUrl = null;
    let fileName = null;

    if (req.file) {
      fileName = `license_${req.userId}_${Date.now()}_${req.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) return serverErrorMessageRes(res, uploadError);

      const { data: publicUrlData } = supabase.storage
        .from("cvs")
        .getPublicUrl(fileName);
      licenseUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("recruiterprofile")
      .upsert(
        {
          user_id: req.userId,
          ...(company_name !== undefined && { company_name }),
          ...(website !== undefined && { website }),
          ...(tax_code !== undefined && { tax_code }),
          ...(exp_years !== undefined && { exp_years }),
          ...(location !== undefined && { location }),
          ...(licenseUrl && { bussiness_license_url: licenseUrl }),
          ...(supplement_info !== undefined && { supplement_info }),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) {
      // Cleanup uploaded file if DB update fails
      if (fileName) {
        await supabase.storage.from("cvs").remove([fileName]);
      }
      return serverErrorMessageRes(res, error);
    }

    return res.status(200).json({
      success: true,
      message: "Recruiter profile updated successfully!",
      data,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

// PUT /user/password — change password (requires old password)
const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Old password and new password are required!",
    });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from old password!",
    });
  }

  try {
    const { data: user, error: findError } = await supabase
      .from("User")
      .select("id, password")
      .eq("id", req.userId)
      .single();

    if (findError) return serverErrorMessageRes(res, findError);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(403)
        .json({ success: false, message: "Old password is incorrect!" });
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from("User")
      .update({ password: hashNewPassword })
      .eq("id", req.userId);

    if (updateError) return serverErrorMessageRes(res, updateError);

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

const approveRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("User")
      .update({ status: AccountStatus.ACTIVE })
      .eq("id", id)
      .select()
      .single();
    if (error) return serverErrorMessageRes(res, error);
    return res.status(200).json({
      success: true,
      message: "Recruiter approved successfully!",
      data,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

const getListPedningRecruiter = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("role", ROLE.RECRUITER)
      .eq("status", AccountStatus.PENDING);

    const { data: profile, error: profileError } = await supabase
      .from("recruiterprofile")
      .select("*")
      .in(
        "user_id",
        data.map((user) => user.id),
      );
    if (error) return serverErrorMessageRes(res, error);
    return res.status(200).json({
      success: true,
      message: "List pedning recruiter",
      data: data.map((user) => ({
        ...user,
        profile: profile.find((profile) => profile.user_id === user.id),
      })),
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

module.exports = {
  getMe,
  updateSeekerProfile,
  updateRecruiterProfile,
  updatePassword,
  approveRecruiter,
  getListPedningRecruiter,
};
