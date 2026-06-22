const ownerMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "owner") {
    return res.status(403).json({
      message: "Access denied. Owner only.",
    });
  }

  next();
};

export default ownerMiddleware;
