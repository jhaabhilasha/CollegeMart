require('dotenv').config();
const { sendMail } = require('./utils/mailer');

(async () => {
  try {
    await sendMail(
      process.env.EMAIL_USER, // send to yourself for test
      'Test Email from SendGrid',
      'This is a test email sent using SendGrid integration.'
    );
    console.log('Test email sent successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to send test email:', err);
    process.exit(1);
  }
})();
