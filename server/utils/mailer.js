require('dotenv').config();
const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

console.log('EMAIL_USER:', process.env.EMAIL_USER);

exports.sendMail = async (to, subject, text) => {
  const msg = {
    to,
    from: process.env.EMAIL_USER, // Must be a verified sender in SendGrid
    subject,
    text,
  };
  console.log('Sending email:', msg);
  await sgMail.send(msg);
};
