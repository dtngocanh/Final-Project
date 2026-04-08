import User from "../models/User.js";
import crypto from "crypto";
import {
  generateEmailTemplate,
  generateResetPasswordToken,
  sendEmail,
} from "../utils/emailUtils.js";
import { sendToken } from "../utils/sendToken.js";

// 1. QUÊN MẬT KHẨU: Gửi mail chứa link kèm token
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const { frontendUrl } = req.query;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Email not found." });

  // Tạo token reset
  const { resetToken, hashedToken, resetPasswordExpireTime } =
    generateResetPasswordToken();

  // Lưu vào DB
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = resetPasswordExpireTime;
  await user.save({ validateBeforeSave: false });

  // Link: http://localhost:5173/password/reset/abc123token
  const resetPasswordUrl = `${frontendUrl}/password/reset/${resetToken}`;
  const message = generateEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Hehe Store Password",
      message,
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Verification email sent! Check your inbox.",
      });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: "Cannot send email, please try again!" });
  }
};

// 2. ĐẶT LẠI MẬT KHẨU: Dùng token từ mail để đổi pass mới
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Tìm user có token khớp và thời gian hết hạn > hiện tại
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid Token." });
  if (password !== confirmPassword)
    return res.status(400).json({ message: "Confirm Password not match." });

  // Cập nhật pass (Middleware Pre-save trong model sẽ tự động hash cái này)
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res
    .status(200)
    .json({
      success: true,
      message: "Your password reset successfully!",
    });
};
// 3. CẬP NHẬT MẬT KHẨU (Khi đang đăng nhập)
export const updatePassword = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // 2. Validation: Ensure all required fields are present
  if (!oldPassword || !newPassword || !confirmPassword) {
    return res
      .status(400)
      .json({ message: "Please enter all required fields" });
  }

  // 3. Verify identity: Check if the entered old password matches the database
  const isMatched = await user.comparePassword(oldPassword);
  if (!isMatched) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  // 4. Validation: Check if the new password and confirmation match
  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "New password and confirm password do not match" });
  }

  // 5. Security Check: Prevent user from reusing the current password
  if (oldPassword === newPassword) {
    return res
      .status(400)
      .json({ message: "New password must be different from the old one" });
  }

  // 6. Update password
  user.password = newPassword;
  await user.save();

  // 7. Re-issue token to maintain session with updated credentials
  sendToken(user, 200, "Your Password is updated.", res);
};
