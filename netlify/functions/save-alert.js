import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const alertsFile = path.join(__dirname, '../../alerts.json');

// Ensure alerts.json exists
function ensureAlertsFile() {
  if (!fs.existsSync(alertsFile)) {
    fs.writeFileSync(alertsFile, JSON.stringify([], null, 2));
  }
}

export default async (req, context) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { eventId, eventName, email, remindBefore, eventTime } = await req.json();

    // Validate
    if (!eventId || !email || !remindBefore || !eventTime) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    if (!email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    ensureAlertsFile();

    // Read existing alerts
    let alerts = [];
    try {
      const content = fs.readFileSync(alertsFile, 'utf8');
      alerts = JSON.parse(content);
    } catch (e) {
      alerts = [];
    }

    // Check if alert already exists for this event + email
    const exists = alerts.some(a => a.eventId === eventId && a.email === email);
    if (exists) {
      return new Response(
        JSON.stringify({ message: 'Alert already set for this event' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add new alert
    const newAlert = {
      id: `${eventId}-${Date.now()}`,
      eventId,
      eventName,
      email,
      remindBefore, // in minutes
      eventTime, // ISO timestamp
      createdAt: new Date().toISOString(),
      sent: false,
    };

    alerts.push(newAlert);
    fs.writeFileSync(alertsFile, JSON.stringify(alerts, null, 2));

    return new Response(
      JSON.stringify({ success: true, message: 'Alert saved' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error saving alert:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save alert' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
