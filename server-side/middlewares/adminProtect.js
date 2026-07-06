const adminProtect = (req, res, next) => {
  try {
    // protect middleware must run first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Administrator privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while authorizing administrator.",
    });
  }
};

export default adminProtect;
