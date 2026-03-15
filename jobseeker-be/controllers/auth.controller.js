const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const supabase = require("../config/connectDB");
const { serverErrorMessageRes } = require("../helpers/serverErrorMessage");
const ROLE = require("../constraints/role");

const handleSignup = async (req, res) => {
  const { email, password, role, name, company_name, location, tax_code } = req.body;

  try {
    // Basic validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required!" });
    }

    if (role === ROLE.ADMIN) {
      return res.status(403).json({ message: "Admin role is not allowed!" });
    }

    // Role-specific validation
    if (role === ROLE.SEEKER && !name) {
      return res.status(400).json({ message: "Name is required for seeker!" });
    }

    if (role === ROLE.RECRUITER) {
      if (!company_name || !location || !tax_code) {
        return res.status(400).json({ message: "Company name, location, and tax code are required for recruiter!" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Business license file is required for recruiter!" });
      }
    }

    // Check for duplicate email
    const { data: existing, error: findError } = await supabase
      .from("User")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findError) return serverErrorMessageRes(res, findError);

    if (existing) {
      return res.status(409).json({ message: "Email has existed!" });
    }

    const hashPass = await bcrypt.hash(password, 10);

    // Create User
    const { data: newUser, error: insertError } = await supabase
      .from("User")
      .insert({
        email,
        password: hashPass,
        role: role,
      })
      .select()
      .single();

    if (insertError) return serverErrorMessageRes(res, insertError);

    // Create Profile
    if (role === ROLE.SEEKER) {
      const { error: profileError } = await supabase.from("seekerprofile").insert({
        user_id: newUser.id,
        fullname: name,
      });
      if (profileError) {
        // Cleanup user if profile fails
        await supabase.from("User").delete().eq("id", newUser.id);
        return serverErrorMessageRes(res, profileError);
      }
    } else if (role === ROLE.RECRUITER) {
      let licenseUrl = null;
      if (req.file) {
        const fileName = `license_${newUser.id}_${Date.now()}_${req.file.originalname}`;
        const { error: uploadError } = await supabase.storage
          .from("cvs")
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
          });

        if (uploadError) {
          await supabase.from("User").delete().eq("id", newUser.id);
          return serverErrorMessageRes(res, uploadError);
        }

        const { data: publicUrlData } = supabase.storage
          .from("cvs")
          .getPublicUrl(fileName);
        licenseUrl = publicUrlData.publicUrl;
      }

      const { error: profileError } = await supabase.from("recruiterprofile").insert({
        user_id: newUser.id,
        company_name,
        location,
        tax_code,
        bussiness_license_url: licenseUrl,
      });

      if (profileError) {
        // Cleanup user if profile fails
        await supabase.from("User").delete().eq("id", newUser.id);
        return serverErrorMessageRes(res, profileError);
      }
    }

    return res.status(201).json({
      success: true,
      message: `Welcome ${email}! Account created successfully.`,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: matchUser, error: findError } = await supabase
      .from("User")
      .select("id, email, password, role")
      .eq("email", email)
      .maybeSingle();

    if (findError) {
      console.log(11);

      return serverErrorMessageRes(res, findError);
    }

    if (!matchUser) {
      return res.status(401).json({ message: "Email does not exist!" });
    }

    const compare = await bcrypt.compare(password, matchUser.password);
    if (!compare) {
      return res.status(401).json({ message: "Password is incorrect!" });
    }

    const refreshToken = jwt.sign(
      { email: matchUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" },
    );

    const accessToken = jwt.sign(
      {
        userId: matchUser.id,
        email: matchUser.email,
        role: matchUser.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    console.log(22);

    serverErrorMessageRes(res, error);
  }
};

const handleLogout = async (req, res) => {
  const cookies = req.headers?.cookie;

  let refreshToken;
  cookies?.split(";").forEach((cookie) => {
    const [key, val] = cookie.trim().split("=");
    if (key === "jwt" && val?.length > 0) {
      refreshToken = val;
    }
  });

  if (!refreshToken) {
    return res.sendStatus(204);
  }

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None" });
  return res.sendStatus(204);
};

module.exports = {
  handleLogin,
  handleLogout,
  handleSignup,
};
