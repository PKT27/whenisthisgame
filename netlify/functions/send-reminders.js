import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const alertsFile = path.join(__dirname, '../../alerts.json');

export default async (req, context) => {
  try {
    // Read alerts
    if (!fs.existsSync(alertsFile)) {
      return { statusCode: 200, body: 'No alerts file' };
    }

    let alerts = [];
    try {
      const content = fs.readFileSync(alertsFile, 'utf8');
      alerts = JSON.parse(content);
    } catch (e) {
      console.error('Error parsing alerts:', e);
      return { statusCode: 200, body: 'Error parsing alerts' };
    }

    const now = Date.now();
    const unsent = alerts.filter(a => !a.sent);

    if (unsent.length === 0) {
      return { statusCode: 200, body: 'No unsent alerts' };
    }

    // Setup Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use app-specific password
      },
    });

    // Check which alerts should be sent now
    let sent = 0;
    for (const alert of unsent) {
      const eventTime = new Date(alert.eventTime).getTime();
      const remindAt = eventTime - alert.remindBefore * 60 * 1000;

      if (now >= remindAt && now < eventTime) {
        try {
          // Send email
          await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: alert.email,
            subject: `⏰ Reminder: ${alert.eventName}`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2>🏆 Your GameTimeNow Alert</h2>
                <p><strong>${alert.eventName}</strong> starts in ${alert.remindBefore} minutes!</p>
                <p style="font-size: 18px; color: #FFD23F; font-weight: bold;">
                  ⏰ ${new Date(alert.eventTime).toLocaleString()}
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">
                  This is a reminder from <a href="https://whenisthisgame.com">GameTimeNow</a>.
                  <br/>Never miss a game in your timezone again.
                </p>
              </div>
            `,
          });

          alert.sent = true;
          sent++;
        } catch (error) {
          console.error(`Failed to send email to ${alert.email}:`, error);
        }
      }
    }

    // Save updated alerts
    fs.writeFileSync(alertsFile, JSON.stringify(alerts, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ sent, checked: unsent.length }),
    };
  } catch (error) {
    console.error('Error in send-reminders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
