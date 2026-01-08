const mongoose = require('mongoose');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

// ============================================
// REMINDER LOG MODEL
// ============================================
const reminderLogSchema = new mongoose.Schema({
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  daysBeforeStart: {
    type: Number,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

// Create unique index to prevent duplicate reminders
reminderLogSchema.index({ hackathon: 1, participant: 1, daysBeforeStart: 1 }, { unique: true });

const ReminderLog = mongoose.model('ReminderLog', reminderLogSchema);

// ============================================
// EMAIL TEMPLATE
// ============================================
const createReminderEmail = (userName, hackathon, daysRemaining) => {
  const dashboardUrl = `${process.env.FRONTEND_URL}/participant/dashboard`;
  
  let urgencyColor = '#2196F3';
  let urgencyMessage = 'coming up';
  let emoji = '📅';
  
  if (daysRemaining === 1) {
    urgencyColor = '#f44336';
    urgencyMessage = 'starting tomorrow!';
    emoji = '🚨';
  } else if (daysRemaining === 2) {
    urgencyColor = '#ff9800';
    urgencyMessage = 'starting very soon!';
    emoji = '⚠️';
  } else if (daysRemaining === 3) {
    urgencyColor = '#ff9800';
    urgencyMessage = 'starting soon!';
    emoji = '⏰';
  } else if (daysRemaining === 5) {
    urgencyColor = '#4CAF50';
    urgencyMessage = 'starting this week!';
    emoji = '📌';
  } else if (daysRemaining === 7) {
    urgencyColor = '#2196F3';
    urgencyMessage = 'starting next week!';
    emoji = '📆';
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 10px;">${emoji}</div>
          <h1 style="color: ${urgencyColor}; margin: 0; font-size: 28px;">Hackathon Reminder</h1>
        </div>
        
        <p style="color: #333; font-size: 18px; font-weight: 500;">Hi ${userName},</p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 8px; margin: 20px 0;">
          <p style="color: white; font-size: 22px; font-weight: 600; margin: 0; text-align: center;">
            ${hackathon.title}
          </p>
          <p style="color: white; font-size: 16px; margin: 10px 0 0 0; text-align: center;">
            is ${urgencyMessage}
          </p>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid ${urgencyColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #856404; margin: 0; font-size: 20px; font-weight: 600;">
            ${emoji} Starting in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0; font-size: 18px;">📝 Event Details</h3>
          <table style="width: 100%; color: #666; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; width: 40%;">Start Date:</td>
              <td style="padding: 8px 0;">${new Date(hackathon.startDate).toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">End Date:</td>
              <td style="padding: 8px 0;">${new Date(hackathon.endDate).toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Submission Deadline:</td>
              <td style="padding: 8px 0;">${new Date(hackathon.submissionDeadline).toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</td>
            </tr>
          </table>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1976d2; margin-top: 0; font-size: 18px;">💡 Preparation Checklist</h3>
          <ul style="color: #555; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li style="margin: 8px 0;">✓ Review hackathon requirements and rules</li>
            <li style="margin: 8px 0;">✓ Set up your development environment</li>
            <li style="margin: 8px 0;">✓ Check your assigned tasks in dashboard</li>
            <li style="margin: 8px 0;">✓ Plan your project timeline and approach</li>
            <li style="margin: 8px 0;">✓ Prepare necessary tools and resources</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; 
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            Go to Dashboard →
          </a>
        </div>

        <div style="border-top: 2px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #999; font-size: 13px; text-align: center; margin: 5px 0;">
            This is an automated reminder for your registered hackathon.
          </p>
          <p style="color: #999; font-size: 13px; text-align: center; margin: 5px 0;">
            Good luck with your participation! 🚀
          </p>
        </div>
      </div>
    </div>
  `;
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const isReminderSent = async (hackathonId, participantId, daysBeforeStart) => {
  const existingLog = await ReminderLog.findOne({
    hackathon: hackathonId,
    participant: participantId,
    daysBeforeStart: daysBeforeStart
  });
  return !!existingLog;
};

const logSentReminder = async (hackathonId, participantId, daysBeforeStart) => {
  try {
    await ReminderLog.create({
      hackathon: hackathonId,
      participant: participantId,
      daysBeforeStart: daysBeforeStart
    });
    return true;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - reminder already logged
      return false;
    }
    throw error;
  }
};

// ============================================
// SEND REMINDER TO SINGLE PARTICIPANT
// ============================================
const sendReminderToParticipant = async (hackathon, participant, daysRemaining) => {
  try {
    // Check if reminder already sent
    const alreadySent = await isReminderSent(hackathon._id, participant._id, daysRemaining);
    if (alreadySent) {
      return { success: true, skipped: true };
    }

    const html = createReminderEmail(participant.name, hackathon, daysRemaining);
    const subject = daysRemaining === 1 
      ? `🚨 Tomorrow: ${hackathon.title} starts!`
      : `${daysRemaining === 2 ? '⚠️' : '📅'} Reminder: ${hackathon.title} starts in ${daysRemaining} days`;

    const emailSent = await sendEmail(participant.email, subject, html);

    if (emailSent) {
      await logSentReminder(hackathon._id, participant._id, daysRemaining);
      console.log(`   ✓ ${participant.email}`);
      return { success: true, skipped: false };
    } else {
      console.error(`   ✗ ${participant.email} - Email send failed`);
      return { success: false, error: 'Email send failed' };
    }
  } catch (error) {
    console.error(`   ✗ ${participant.email} - ${error.message}`);
    return { success: false, error: error.message };
  }
};

// ============================================
// MAIN REMINDER CHECK FUNCTION
// ============================================
const checkAndSendReminders = async () => {
  try {
    console.log('╔════════════════════════════════════════╗');
    console.log('║     STARTING REMINDER CHECK           ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('Time:', new Date().toLocaleString());
    console.log('');

    const reminderDays = [7, 5, 3, 2, 1]; // Days before hackathon
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Midnight for date comparison

    let totalSent = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    // Find all active hackathons with future start dates
    const hackathons = await Hackathon.find({ 
      status: 'active',
      startDate: { $gt: now }
    }).populate('participants', 'name email');

    console.log(`📊 Found ${hackathons.length} active upcoming hackathon(s)\n`);

    if (hackathons.length === 0) {
      console.log('ℹ️  No upcoming hackathons found.\n');
      return {
        success: true,
        sent: 0,
        skipped: 0,
        failed: 0,
        message: 'No upcoming hackathons'
      };
    }

    for (const hackathon of hackathons) {
      const startDate = new Date(hackathon.startDate);
      startDate.setHours(0, 0, 0, 0);

      const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));

      console.log('─────────────────────────────────────────');
      console.log(`📌 Hackathon: ${hackathon.title}`);
      console.log(`   Start Date: ${startDate.toDateString()}`);
      console.log(`   Days Until Start: ${daysUntilStart}`);
      console.log(`   Participants: ${hackathon.participants.length}`);

      // Check if we should send reminders today
      if (reminderDays.includes(daysUntilStart)) {
        console.log(`   📧 Sending ${daysUntilStart}-day reminder(s)...\n`);

        for (const participant of hackathon.participants) {
          const result = await sendReminderToParticipant(hackathon, participant, daysUntilStart);
          
          if (result.success && !result.skipped) {
            totalSent++;
          } else if (result.skipped) {
            totalSkipped++;
          } else {
            totalFailed++;
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log('');
      } else {
        console.log(`   ⏭️  No reminders scheduled for ${daysUntilStart} days before\n`);
      }
    }

    console.log('═════════════════════════════════════════');
    console.log('           SUMMARY                       ');
    console.log('═════════════════════════════════════════');
    console.log(`✓ Emails Sent:     ${totalSent}`);
    console.log(`⊘ Already Sent:    ${totalSkipped}`);
    console.log(`✗ Failed:          ${totalFailed}`);
    console.log('═════════════════════════════════════════\n');

    return {
      success: true,
      sent: totalSent,
      skipped: totalSkipped,
      failed: totalFailed
    };

  } catch (error) {
    console.error('\n❌ ERROR in checkAndSendReminders:', error.message);
    console.error(error.stack);
    console.log('');
    return {
      success: false,
      error: error.message
    };
  }
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  checkAndSendReminders,
  sendReminderToParticipant,
  ReminderLog
};