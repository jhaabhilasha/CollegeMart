require('dotenv').config();
const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const getSender = () => {
  const email = process.env.EMAIL_USER || 'no-reply@collegeconnect.com';
  return {
    name: 'CollegeConnect',
    email: email.trim()
  };
};

/**
 * Standard sendMail wrapper supporting both text and HTML versions
 */
exports.sendMail = async (to, subject, text, html) => {
  if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_USER) {
    console.warn(`[MAILER] SendGrid not configured. Outputting email to console:\nTo: ${to}\nSubject: ${subject}\nText:\n${text}`);
    return { success: true, simulated: true };
  }

  const msg = {
    to: to.trim(),
    from: getSender(),
    subject,
    text,
    ...(html ? { html } : {}),
    headers: {
      'X-Entity-Ref-ID': Date.now().toString(),
      'X-Priority': '1 (Highest)',
    }
  };

  try {
    console.log(`[MAILER] Sending email to ${to}: "${subject}"`);
    const [response] = await sgMail.send(msg);
    return { success: true, statusCode: response.statusCode };
  } catch (err) {
    console.error('[MAILER ERROR] SendGrid failed:', err.response?.body || err.message);
    console.info(`[MAILER FALLBACK] Content for ${to}:\n${text}`);
    throw err;
  }
};

/**
 * High-deliverability transactional OTP email template
 * Designed to land in Primary Inbox (not Spam) with clear CollegeConnect branding.
 */
exports.sendOtpEmail = async (to, otp, purpose = 'Password Reset') => {
  const isPasswordReset = purpose.toLowerCase().includes('password');
  const actionTitle = isPasswordReset ? 'Password Reset Verification' : 'Login Verification Code';
  const introText = isPasswordReset
    ? 'We received a request to reset the password for your CollegeConnect account. Use the verification code below to complete the reset process.'
    : 'Use the verification code below to sign in to your CollegeConnect account.';

  const subject = `${otp} is your CollegeConnect verification code`;

  const text = `CollegeConnect Verification Code

Hello,

${introText}

Your 6-Digit Verification Code:
${otp}

This code expires in 10 minutes.
For your security, do NOT share this code with anyone.

If you did not request this verification code, please ignore this email. Your account remains safe.

--
CollegeConnect Campus Marketplace
https://collegeconnect.com
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CollegeConnect Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:540px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.08),0 8px 10px -6px rgba(0,0,0,0.05);border:1px solid #e4e4e7;" cellpadding="0" cellspacing="0">
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #d9530f 0%, #ea580c 50%, #f97316 100%);padding:32px 24px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#ffffff;width:52px;height:52px;border-radius:14px;line-height:52px;text-align:center;font-weight:900;font-size:24px;color:#d9530f;margin-bottom:12px;box-shadow:0 4px 10px rgba(0,0,0,0.15);">
                      CC
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
                      CollegeConnect
                    </h1>
                    <p style="margin:6px 0 0 0;color:#ffedd5;font-size:13px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;">
                      Official Verification Service
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:36px 32px 28px 32px;">
              <h2 style="margin:0 0 14px 0;color:#18181b;font-size:20px;font-weight:700;">
                ${actionTitle}
              </h2>
              <p style="margin:0 0 20px 0;font-size:15px;line-height:24px;color:#52525b;">
                ${introText}
              </p>

              <!-- Prominent OTP Display Box -->
              <div style="background-color:#fff7ed;border:2px dashed #ea580c;border-radius:14px;padding:26px 20px;text-align:center;margin:24px 0;">
                <span style="display:block;font-size:12px;font-weight:700;text-transform:uppercase;color:#c2410c;letter-spacing:2px;margin-bottom:10px;">
                  Your 6-Digit OTP Code
                </span>
                <div style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,Courier,monospace;font-size:38px;font-weight:900;color:#9a3412;letter-spacing:10px;padding:6px 0;user-select:all;">
                  ${otp}
                </div>
                <div style="display:inline-block;background-color:#fed7aa;color:#9a3412;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-top:12px;">
                  ⏱ Valid for 10 minutes
                </div>
              </div>

              <!-- Security Notice -->
              <div style="background-color:#f8fafc;border-left:4px solid #f97316;border-radius:6px;padding:14px 16px;margin:24px 0 16px 0;">
                <p style="margin:0;font-size:13px;line-height:20px;color:#475569;">
                  <strong>Security Reminder:</strong> Never share this code with anyone. CollegeConnect administrators will never ask for your verification code.
                </p>
              </div>

              <p style="margin:20px 0 0 0;font-size:13px;line-height:20px;color:#71717a;">
                If you did not initiate this request, you can safely disregard this email. Your account credentials remain fully protected.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;border-top:1px solid #f4f4f5;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:#a1a1aa;font-weight:600;">
                CollegeConnect &bull; Campus Marketplace
              </p>
              <p style="margin:0;font-size:11px;color:#a1a1aa;">
                This is an automated transactional security email sent to ${to}. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return exports.sendMail(to, subject, text, html);
};

/**
 * High-deliverability account verification email template
 */
exports.sendAccountVerificationEmail = async (to, verifyUrl) => {
  const subject = `Verify your CollegeConnect email address`;
  const text = `Welcome to CollegeConnect!

Please verify your college email address by clicking the link below:
${verifyUrl}

This link is valid for 24 hours.

If you didn't create an account, please ignore this email.

--
CollegeConnect Team
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your CollegeConnect Email</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:540px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.08);border:1px solid #e4e4e7;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:linear-gradient(135deg, #d9530f 0%, #ea580c 50%, #f97316 100%);padding:32px 24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">CollegeConnect</h1>
              <p style="margin:6px 0 0 0;color:#ffedd5;font-size:13px;font-weight:500;">Welcome to Campus Marketplace</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="margin:0 0 14px 0;color:#18181b;font-size:20px;font-weight:700;">Confirm Your Email Address</h2>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:24px;color:#52525b;">
                Thanks for joining CollegeConnect! Please confirm your email address by clicking the button below to activate your account.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${verifyUrl}" style="background-color:#ea580c;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;padding:14px 32px;border-radius:12px;display:inline-block;box-shadow:0 4px 12px rgba(234,88,12,0.3);">
                  Verify Email Address
                </a>
              </div>
              <p style="margin:24px 0 0 0;font-size:12px;color:#71717a;word-break:break-all;">
                Or copy and paste this link in your browser:<br>
                <a href="${verifyUrl}" style="color:#ea580c;">${verifyUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#fafafa;border-top:1px solid #f4f4f5;padding:20px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a1a1aa;">
                &copy; ${new Date().getFullYear()} CollegeConnect &bull; All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return exports.sendMail(to, subject, text, html);
};
