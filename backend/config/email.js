const nodemailer = require('nodemailer');

// Create reusable transporter - use port 465 with SSL for Render compatibility
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify transporter configuration on startup (non-blocking)
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error.message);
    console.error('Email sending may not work, but registration will still succeed.');
  } else {
    console.log('✓ Email server is ready to send messages');
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    console.log('Attempting to send email to:', to);
    
    const mailOptions = {
      from: `"Hackathon Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('✗ Email sending failed:', error.message);
    return false;
  }
};

module.exports = { sendEmail };