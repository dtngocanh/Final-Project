import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, message, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const options = {
    httpOnly: true,
    secure: true, // Luôn bật true (Render dùng HTTPS nên bắt buộc phải true)
    sameSite: "none", // Luôn để 'none' để Front-end và Back-end khác domain vẫn nhận được
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user: safeUser,
    token,
  });
};

export const sendSellerToken = (user, statusCode, message, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isDevelopment = process.env.NODE_ENV === "development";

  const options = {
    httpOnly: true,
    secure: !isDevelopment, 
    sameSite: isDevelopment ? "lax" : "none", 
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  res.status(statusCode).cookie("sellerToken", token, options).json({
    success: true,
    message,
    token,
  });
};