# Gmail API Integration Setup Guide for Admin Email

This guide will help you set up Google Gmail API integration for sending approval emails from the admin account `sarinonhoelivan29@gmail.com`.

## Prerequisites

1. Access to `sarinonhoelivan29@gmail.com` Google account
2. Access to Google Cloud Console
3. Laravel application running

## Step 1: Google Cloud Console Setup

### 1.1 Create or Select a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

### 1.2 Enable Gmail API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" and then "Enable"

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Set the name (e.g., "PWD RMS Admin Gmail Integration")
5. Add authorized redirect URIs:
   - For development: `http://localhost:8000/api/gmail/callback`
   - For production: `https://yourdomain.com/api/gmail/callback`
6. Click "Create"
7. Download the JSON file or copy the Client ID and Client Secret

## Step 2: Environment Configuration

### 2.1 Update .env File
Add the following variables to your `.env` file:

```env
# Gmail API Configuration for Admin Email
GOOGLE_CLIENT_ID=your_client_id_from_step_1
GOOGLE_CLIENT_SECRET=your_client_secret_from_step_1
GOOGLE_REDIRECT_URI=http://localhost:8000/api/gmail/callback
GOOGLE_REFRESH_TOKEN=

# Frontend URL for login links
FRONTEND_URL=http://localhost:3000

# Mail Configuration (fallback - using admin email)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=sarinonhoelivan29@gmail.com
MAIL_PASSWORD=your_app_password_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=sarinonhoelivan29@gmail.com
MAIL_FROM_NAME="Cabuyao PDAO RMS"
```

### 2.2 Gmail App Password (for SMTP fallback)
1. Enable 2-factor authentication on `sarinonhoelivan29@gmail.com`
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use this password in `MAIL_PASSWORD`

## Step 3: OAuth Authorization

### 3.1 Get Authorization URL
Make a GET request to:
```
GET /api/gmail/auth-url
```

This will return an authorization URL.

### 3.2 Complete OAuth Flow
1. Visit the authorization URL in your browser
2. Sign in with `sarinonhoelivan29@gmail.com`
3. Grant permissions to the application
4. You'll be redirected to your callback URL with an authorization code

### 3.3 Exchange Code for Tokens
Make a POST request to:
```
POST /api/gmail/callback
Content-Type: application/json

{
    "code": "authorization_code_from_step_3.2"
}
```

This will return a refresh token. Add this refresh token to your `.env` file:
```env
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

## Step 4: Test the Integration

### 4.1 Check Configuration Status
```
GET /api/gmail/status
```

### 4.2 Test Email Sending
```
GET /api/gmail/test
```

This will send a test email to `sarinonhoelivan29@gmail.com` to verify the integration is working.

### 4.3 Test Integration Status
```
GET /api/test-gmail-integration
```

This will show the current configuration status.

## Step 5: Usage

The Gmail API integration is now automatically used when approving applications. The system will:

1. Try to send emails via Gmail API first (from `sarinonhoelivan29@gmail.com`)
2. Fall back to SMTP if Gmail API fails
3. Log all email sending attempts

### Email Flow
When an admin approves a PWD application:
1. System creates user account with generated credentials
2. Sends approval email via Gmail API from `sarinonhoelivan29@gmail.com`
3. Email includes PWD ID, login credentials, and login URL
4. Logs the email sending attempt

### Email Template
The approval email uses the template at `resources/views/emails/application-approved.blade.php` and includes:
- Congratulations message
- PWD ID
- Login credentials (email and password)
- Login URL
- Support information
- Sent from `sarinonhoelivan29@gmail.com`

## Troubleshooting

### Common Issues

1. **"Gmail API is not properly configured"**
   - Check that all environment variables are set correctly
   - Verify the OAuth flow was completed successfully

2. **"Authorization failed"**
   - Ensure the redirect URI matches exactly
   - Check that the Gmail API is enabled in Google Cloud Console
   - Make sure you're using `sarinonhoelivan29@gmail.com` for OAuth

3. **"Failed to send test email"**
   - Verify the refresh token is valid
   - Check that `sarinonhoelivan29@gmail.com` has proper permissions
   - Ensure the Gmail account has 2FA enabled

### Logs
Check Laravel logs for detailed error messages:
```bash
tail -f storage/logs/laravel.log
```

### Manual Testing
You can test the email service directly:
```php
$emailService = new \App\Services\EmailService();
$result = $emailService->sendApplicationApprovalEmail([
    'firstName' => 'Test',
    'lastName' => 'User',
    'email' => 'test@example.com',
    'password' => 'testpass123',
    'pwdId' => 'PWD-TEST-001'
]);
```

## Security Notes

1. Keep your client secret secure
2. Use environment variables for all sensitive data
3. Regularly rotate refresh tokens
4. Monitor API usage in Google Cloud Console
5. Consider implementing rate limiting for production use
6. Ensure `sarinonhoelivan29@gmail.com` has proper security settings

## Production Considerations

1. Update redirect URIs for production domain
2. Set up proper error monitoring
3. Implement email queuing for high volume
4. Use a dedicated Gmail account for the application
5. Set up proper logging and monitoring
6. Ensure `sarinonhoelivan29@gmail.com` is properly secured

## Admin Email Specific Notes

- All emails will be sent from `sarinonhoelivan29@gmail.com`
- The admin email must have Gmail API access enabled
- OAuth flow must be completed with `sarinonhoelivan29@gmail.com`
- App password should be generated for `sarinonhoelivan29@gmail.com`
- All email templates will show "From: Cabuyao PDAO RMS <sarinonhoelivan29@gmail.com>"
