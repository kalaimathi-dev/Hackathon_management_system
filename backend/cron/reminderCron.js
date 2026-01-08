const cron = require('node-cron');
const { checkAndSendReminders } = require('../services/reminderService');

/**
 * Start the reminder cron job
 * Runs daily at 9:00 AM to check and send hackathon reminders
 * 
 * Cron Schedule Format: minute hour day month weekday
 * '0 9 * * *' = At 9:00 AM every day
 * 
 * Examples:
 * '0 8 * * *'     = 8:00 AM daily
 * '0 12 * * *'    = 12:00 PM (noon) daily
 * '0 6,18 * * *'  = 6:00 AM and 6:00 PM daily
 * '30 9 * * *'    = 9:30 AM daily
 * '0 9 * * 1-5'   = 9:00 AM on weekdays only
 */
const startReminderCron = () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  🕒 Reminder Cron Job Initialized     ║');
  console.log('║  📅 Schedule: Daily at 9:00 AM        ║');
  console.log('║  ⏰ Timezone: Asia/Kolkata            ║');
  console.log('║  📧 Reminders: 7,5,3,2,1 days before  ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Main cron job - runs at 9:00 AM every day
  cron.schedule('0 9 * * *', async () => {
    console.log('\n🔔 ==========================================');
    console.log('   SCHEDULED REMINDER CHECK');
    console.log('   Time:', new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long'
    }));
    console.log('==========================================\n');
    
    try {
      await checkAndSendReminders();
    } catch (error) {
      console.error('❌ ERROR in scheduled reminder job:', error.message);
      console.error(error.stack);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Change this to your timezone
    // Other timezone examples:
    // "America/New_York"
    // "Europe/London"
    // "Asia/Tokyo"
    // "Australia/Sydney"
  });

  console.log('✅ Cron job started successfully!');
  console.log('⏰ Next scheduled run: Tomorrow at 9:00 AM\n');

  // Development mode: Run test reminder check after 10 seconds
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 DEVELOPMENT MODE DETECTED');
    console.log('   Running test reminder check in 10 seconds...');
    console.log('   (This only happens in development mode)\n');
    
    setTimeout(async () => {
      try {
        console.log('\n🧪 ==========================================');
        console.log('   DEVELOPMENT TEST REMINDER CHECK');
        console.log('   Time:', new Date().toLocaleString());
        console.log('==========================================\n');
        
        await checkAndSendReminders();
      } catch (error) {
        console.error('❌ ERROR in test reminder check:', error.message);
        console.error(error.stack);
      }
    }, 10000); // 10 seconds delay
  }
};

module.exports = { startReminderCron };