const supabase = require("../config/connectDB");
const { serverErrorMessageRes } = require("../helpers/serverErrorMessage");

// POST /seeker/cv — upload a CV file to Supabase Storage and append URL to seekerprofile.cv_url
const uploadCv = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded!" });
    }

    const { originalname, buffer, mimetype } = req.file;
    const timestamp = Date.now();
    const filePath = `${req.userId}/${timestamp}_${originalname}`;

    // Upload to Supabase Storage bucket "cvs"
    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(filePath, buffer, { contentType: mimetype, upsert: false });

    if (uploadError) return serverErrorMessageRes(res, uploadError);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("cvs")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Fetch existing cv_url array from seekerprofile
    const { data: profile } = await supabase
      .from("seekerprofile")
      .select("cv_url")
      .eq("user_id", req.userId)
      .maybeSingle();

    const existingCvs = Array.isArray(profile?.cv_url) ? profile.cv_url : [];
    const updatedCvs = [
      ...existingCvs,
      { name: originalname, url: publicUrl, uploaded_at: new Date().toISOString() },
    ];

    // Upsert seekerprofile with updated cv_url
    const { data, error: upsertError } = await supabase
      .from("seekerprofile")
      .upsert(
        { user_id: req.userId, cv_url: updatedCvs },
        { onConflict: "user_id" },
      )
      .select("cv_url")
      .single();

    if (upsertError) return serverErrorMessageRes(res, upsertError);

    return res.status(200).json({
      success: true,
      message: "CV uploaded successfully!",
      url: publicUrl,
      cv_url: data.cv_url,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

module.exports = { uploadCv };
