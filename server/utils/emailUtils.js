import crypto from "crypto";
import nodeMailer from "nodemailer";

// 1. Generate Email Template (HTML)
export const generateEmailTemplate = (resetPasswordUrl) => {
  return `
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #000; color: #fff;">
     <h2 style="color: #fff; text-align: center;">Reset Your Password</h2>
     <p style="font-size: 16px; color: #ccc;">Dear User,</p>
     <p style="font-size: 16px; color: #ccc;">You requested to reset your password. Please click the button below to proceed:</p>
     <div style="text-align: center; margin: 20px 0;">
       <a href="${resetPasswordUrl}" style="display: inline-block; font-size: 16px; font-weight: bold; color: #000; text-decoration: none; padding: 12px 20px; border: 1px solid #fff; border-radius: 5px; background-color: #fff;">
         Reset Password
       </a>
     </div>
     <p style="font-size: 16px; color: #ccc;">If you did not request this, please ignore this email. The link will expire in 15 minutes.</p>
     <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
       <p>Thank you,<br>Ecommerce Team</p>
     </footer>
   </div>
  `;
};

// 2. Generate Password Reset Token
export const generateResetPasswordToken = () => {
  // Generate a random raw string (sent to the user via email)
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash the token (stored in the database for better security)
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Expiration time: 30 minutes from now
  const resetPasswordExpireTime = Date.now() + 30 * 60 * 1000;

  return { resetToken, hashedToken, resetPasswordExpireTime };
};

// 3. Configure Email Delivery via Nodemailer
export const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `Ecommerce Team <${process.env.SMTP_MAIL}>`,
    to: email,
    subject: subject,
    html: message,
  };

  await transporter.sendMail(mailOptions);
};