# Quick Gmail API Setup Guide

## The Issue
The email system is correctly configured to send emails TO the applicant's email address, but the Gmail API might not be properly set up yet.

## Quick Setup Steps

### 1. Check Current Status
Visit: `http://localhost:8000/api/test-gmail-integration`

This will show you what's configured and what's missing.

### 2. Set Up Google Cloud Console (if not done yet)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add redirect URI: `http://localhost:8000/api/gmail/callback`
   - Copy the Client ID and Client Secret

### 3. Update .env File
Add these to your `.env` file:

```env
# Gmail API Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/gmail/callback
GOOGLE_REFRESH_TOKEN=

# Mail Configuration (fallback)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=sarinonhoelivan29@gmail.com
MAIL_PASSWORD=your_app_password_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=sarinonhoelivan29@gmail.com
MAIL_FROM_NAME="Cabuyao PDAO RMS"
```

### 4. Complete OAuth Flow

1. Get authorization URL:
   ```
   GET http://localhost:8000/api/gmail/auth-url
   ```

2. Visit the returned URL and sign in with `sarinonhoelivan29@gmail.com`

3. Complete the OAuth flow and get the refresh token

4. Add the refresh token to your `.env` file:
   ```env
   GOOGLE_REFRESH_TOKEN=your_refresh_token_here
   ```

### 5. Test Email Sending

Test sending an email to any email address:
```
GET http://localhost:8000/api/test-send-approval-email/your-email@example.com
```

Replace `your-email@example.com` with the email address where you want to receive the test email.

### 6. Check Logs
If emails still don't work, check the Laravel logs:
```bash
tail -f storage/logs/laravel.log
```

## How It Works

1. **Email Recipient**: The system sends emails TO the applicant's email address (the one they used when registering)
2. **Email Sender**: Emails are sent FROM `sarinonhoelivan29@gmail.com` (your admin account)
3. **Fallback**: If Gmail API fails, it falls back to SMTP using the same admin email

## Testing Steps

1. First, check the configuration status
2. Set up Gmail API if needed
3. Test with a real email address
4. Check logs for any errors
5. Try approving a real application to see if it works

The system is designed to send approval emails to applicants, not to the admin email. The admin email (`sarinonhoelivan29@gmail.com`) is only used as the sender.
