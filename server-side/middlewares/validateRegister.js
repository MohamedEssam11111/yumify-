// middlewares/register.middleware.js

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  // Validate name
  if (name.trim().length < 3) {
    return res.status(400).json({
      message: "Name must be at least 3 characters",
    });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  // Validate password
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  // Validate role
  const allowedRoles = ["customer", "owner"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  next();
};

export default validateRegister;
