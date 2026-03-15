const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.role;
    if (!role) {
      return res
        .status(401)
        .json({ message: "You haven't login yet! Please try again!" });
    }

    const result = [...allowedRoles].includes(role);

    if (!result)
      return res
        .status(403)
        .json({ message: "You are not allowed to access this data!" });
    next();
  };
};

module.exports = verifyRoles;
