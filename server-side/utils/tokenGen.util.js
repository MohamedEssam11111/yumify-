import jwt from "jsonwebtoken";

export const generateToken = (res, user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE,
    maxAge: 12 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
