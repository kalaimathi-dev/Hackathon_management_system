const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' service for Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('✓ Email server is ready to send messages');
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    console.log('Attempting to send email to:', to);
    
    const mailOptions = {
      from: `"Hackathon Platform" <${process.env.EMAIL_USER}>`, // Use EMAIL_USER as sender
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('✗ Email sending failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

module.exports = { sendEmail };