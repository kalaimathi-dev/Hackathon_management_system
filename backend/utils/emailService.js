const { sendEmail } = require('../config/email');

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  console.log('Sending verification email to:', user.email);
  console.log('Verification URL:', verificationUrl);
  console.log('Token:', token);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Hi ${user.name},</p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Thank you for registering! Please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          Or copy and paste this link in your browser:
        </p>
        <p style="color: #667eea; font-size: 14px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
          ${verificationUrl}
        </p>
        <p style="color: #999; font-size: 13px; margin-top: 30px;">
          This link will expire in 24 hours.
        </p>
        <p style="color: #999; font-size: 13px;">
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail(user.email, 'Verify Your Email - Hackathon Management', html);
  
  if (result) {
    console.log('Verification email sent successfully');
  } else {
    console.error('Failed to send verification email');
  }
  
  return result;
};

const sendTaskAssignmentEmail = async (user, task, hackathon, assignmentMethod) => {
  const dashboardUrl = `${process.env.FRONTEND_URL}/participant/dashboard`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Task Assigned!</h2>
      <p>Hi ${user.name},</p>
      <p>A new task has been assigned to you in <strong>${hackathon.title}</strong>.</p>
      
      <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin-top: 0; color: #2196F3;">${task.title}</h3>
        <p><strong>Difficulty:</strong> ${task.difficulty}</p>
        <p><strong>Points:</strong> ${task.points}</p>
        <p><strong>Assignment Method:</strong> ${assignmentMethod}</p>
        <p><strong>Description:</strong></p>
        <p>${task.description}</p>
      </div>

      <p><strong>Submission Deadline:</strong> ${new Date(hackathon.submissionDeadline).toLocaleString()}</p>
      
      <a href="${dashboardUrl}" 
         style="display: inline-block; padding: 12px 24px; background-color: #2196F3; 
                color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        View Task Details
      </a>
      
      <p>Good luck with your submission!</p>
    </div>
  `;

  return await sendEmail(user.email, `Task Assigned: ${task.title}`, html);
};

const sendSubmissionConfirmationEmail = async (user, task, hackathon, submission) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Submission Received!</h2>
      <p>Hi ${user.name},</p>
      <p>Your submission for <strong>${task.title}</strong> has been received successfully.</p>
      
      <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Hackathon:</strong> ${hackathon.title}</p>
        <p><strong>Task:</strong> ${task.title}</p>
        <p><strong>Submitted At:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
        <p><strong>Submission URL:</strong> <a href="${submission.submissionUrl}">${submission.submissionUrl}</a></p>
        ${submission.isLate ? '<p style="color: red;"><strong>Note:</strong> This is a late submission.</p>' : ''}
      </div>

      <p>Your submission will be evaluated by the judges. You will be notified once the evaluation is complete.</p>
      <p>You can submit again before the deadline. Only your latest submission will be considered.</p>
    </div>
  `;

  return await sendEmail(user.email, 'Submission Confirmation', html);
};

const sendEvaluationResultEmail = async (user, task, hackathon, evaluation) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Task Evaluated!</h2>
      <p>Hi ${user.name},</p>
      <p>Your submission for <strong>${task.title}</strong> has been evaluated.</p>
      
      <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Hackathon:</strong> ${hackathon.title}</p>
        <p><strong>Task:</strong> ${task.title}</p>
        <p><strong>Score:</strong> <span style="font-size: 24px; color: #4CAF50;">${evaluation.score}/100</span></p>
        ${evaluation.feedback ? `<p><strong>Feedback:</strong><br>${evaluation.feedback}</p>` : ''}
      </div>

      <p>Thank you for participating!</p>
    </div>
  `;

  return await sendEmail(user.email, 'Evaluation Result', html);
};

module.exports = {
  sendVerificationEmail,
  sendTaskAssignmentEmail,
  sendSubmissionConfirmationEmail,
  sendEvaluationResultEmail
};