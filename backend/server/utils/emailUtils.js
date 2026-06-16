import crypto from "crypto";
import nodeMailer from "nodemailer";

// 1. Generate Email Template (HTML)
export const generateEmailTemplate = (resetPasswordUrl) => {
  return `
    <div style="font-family: 'Poppins', 'Montserrat', Helvetica, Arial, sans-serif; max-width: 550px; margin: 40px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            
      <p style="font-size: 15px; line-height: 24px; color: #475569; margin-bottom: 8px;">
        Hi there,
      </p>
      <p style="font-size: 15px; line-height: 24px; color: #475569; margin-bottom: 24px;">
        We received a request to reset the password for your account. Please click the button below to proceed and set up a new password:
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetPasswordUrl}" style="display: inline-block; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; background-color: #2563eb; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
          Reset Password
        </a>
      </div>
      
      <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0;">
          <strong>Note:</strong> This link will <strong>expire in 15 minutes</strong>. If you did not make this request, you can safely ignore this email and your password will remain secure.
        </p>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;" />

      <footer style="text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 20px;">
          Thank you,<br>
          <strong>Fresh Market Support Team</strong>
        </p>
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
  const resetPasswordExpireTime = Date.now() + 15 * 60 * 1000;

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
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `FreshMart Team <${process.env.SMTP_MAIL}>`,
    to: email,
    subject: subject,
    html: message,
  };

  await transporter.sendMail(mailOptions);
};
