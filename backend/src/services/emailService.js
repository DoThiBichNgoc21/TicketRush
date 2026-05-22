import nodemailer from 'nodemailer';
import crypto from 'crypto';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password',
    },
    connectionTimeout: 10000, 
  });
}

/**
 * Hàm tạo verification token (plaintext)
 * @returns {object} { token: string, expiresAt: Date }
 */
export function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ
  return { token, expiresAt };
}

/**
 * Hàm hash token (SHA256)
 * @param {string} token - Verification token plaintext
 * @returns {string} Hash của token
 */
export function hashVerificationToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Hàm gửi email xác thực
 * @param {string} email - Email của user
 * @param {string} token - Verification token (plaintext)
 * @returns {Promise}
 */
export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border-bottom: 1px solid #ddd; }
          .button { display: inline-block; background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
          .warning { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎟️ TicketRush - Xác thực Email</h1>
          </div>
          <div class="content">
            <p>Chào bạn,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản TicketRush! Để hoàn tất quy trình đăng ký, vui lòng xác thực email của bạn bằng cách nhấp vào nút bên dưới:</p>
            <div style="text-align: center;">
              <a href="${verifyUrl}" class="button">🔐 Xác thực Email</a>
            </div>
            <p>Hoặc sao chép link này vào trình duyệt:</p>
            <p><code>${verifyUrl}</code></p>
            <div class="warning">
              <strong>⚠️ Lưu ý:</strong> Link này sẽ hết hạn trong 24 giờ. Nếu link hết hạn, bạn có thể yêu cầu gửi lại mã xác thực ở trang đăng nhập.
            </div>
            <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,<br>Đội ngũ TicketRush</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 TicketRush. All rights reserved.</p>
            <p>Đây là email tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const transporter = createTransporter();
    // Verify connection/auth before sending to surface auth errors early
    await transporter.verify();
    const maskedUser = process.env.SMTP_USER ? process.env.SMTP_USER.replace(/.(?=.{2,}@)/g, '*') : 'n/a';
    console.info(`SMTP verified: host=${process.env.SMTP_HOST} user=${maskedUser}`);

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `TicketRush <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🎟️ Xác thực email TicketRush - Link xác thực',
      html: htmlContent,
      text: `Vui lòng xác thực email của bạn bằng link: ${verifyUrl}`,
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    if (error && (error.code === 'EAUTH' || /Invalid login/i.test(error.message))) {
      throw new Error('SMTP authentication failed. Kiểm tra SMTP_USER và SMTP_PASS trong .env');
    }
    throw new Error(`Không thể gửi email xác thực: ${error.message}`);
  }
}

/**
 * Hàm gửi email thông báo đăng ký thành công (sau verify)
 * @param {string} email
 * @param {string} username
 * @returns {Promise}
 */
export async function sendWelcomeEmail(email, username) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border-bottom: 1px solid #ddd; }
          .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Chào mừng đến TicketRush</h1>
          </div>
          <div class="content">
            <p>Chào ${username},</p>
            <p>✅ Email của bạn đã được xác thực thành công! Tài khoản TicketRush của bạn đã sẵn sàng để sử dụng.</p>
            <p>Bây giờ bạn có thể:</p>
            <ul>
              <li>Tìm kiếm và đặt vé sự kiện yêu thích</li>
              <li>Quản lý đơn đặt hàng của bạn</li>
              <li>Nhận thông báo về các sự kiện mới</li>
              <li>Lưu các sự kiện ưa thích</li>
            </ul>
            <p>Chúc bạn có trải nghiệm tuyệt vời cùng TicketRush!</p>
            <p>Trân trọng,<br>Đội ngũ TicketRush</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 TicketRush. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const transporter = createTransporter();
    await transporter.verify();
    const maskedUser = process.env.SMTP_USER ? process.env.SMTP_USER.replace(/.(?=.{2,}@)/g, '*') : 'n/a';
    console.info(`SMTP verified: host=${process.env.SMTP_HOST} user=${maskedUser}`);

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `TicketRush <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🎉 Chào mừng đến TicketRush!',
      html: htmlContent,
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Không throw error vì email chào mừng không bắt buộc
    return { success: false, error: error.message };
  }
}

export default {
  generateVerificationToken,
  hashVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
};
