
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = (to, subject, text, html) => {
  const msg = {
    to,
    from: 'ayalaarturo925@gmail.com', // Replace with your verified sender email
    subject,
    text,
    html,
  };

  return sgMail.send(msg);
};

module.exports = sendEmail;