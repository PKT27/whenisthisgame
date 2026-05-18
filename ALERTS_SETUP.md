# GameTimeNow Alerts System

## Setup Instructions

### 1. Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Generate a password
4. Copy the 16-character password

### 2. Netlify Environment Variables
1. Go to your Netlify site settings → Environment
2. Add these variables:
   ```
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASSWORD=your-16-char-password
   ```

### 3. Deploy
```bash
git add .
git commit -m "Add email alert backend"
git push
```

Netlify will automatically:
- Install dependencies from `netlify/functions/package.json`
- Deploy the functions
- Run `send-reminders` every 5 minutes

### How It Works

**Frontend Flow:**
1. User clicks "Alert me"
2. Enters email and reminder time
3. Frontend calls `/api/save-alert` with event details
4. Toast confirms "Alert set"

**Backend Flow:**
1. `send-reminders` function runs every 5 minutes
2. Checks `alerts.json` for alerts that should send now
3. Sends email via Gmail SMTP
4. Marks alert as sent
5. Saves updated file

**Alerts persist** in `alerts.json` (included in Git repo)
