const { Resend } = require('resend');

// Initialize Resend with API key
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Log email configuration status
if (resend) {
  console.log('✓ Resend email service configured');
} else {
  console.log('⚠️ RESEND_API_KEY not set - emails will not be sent');
}

const sendEmail = async (to, subject, html) => {
  try {
    console.log('Attempting to send email to:', to);
    
    if (!resend) {
      console.log('⚠️ Email service not configured (RESEND_API_KEY missing)');
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: 'Hackathon Platform <onboarding@resend.dev>', // Use Resend's default sender for testing
      to: to,
      subject: subject,
      html: html
    });

    if (error) {
      console.error('✗ Email sending failed:', error.message);
      return false;
    }

    console.log('✓ Email sent successfully! ID:', data.id);
    return true;
  } catch (error) {
    console.error('✗ Email sending failed:', error.message);
    return false;
  }
};

module.exports = { sendEmail };