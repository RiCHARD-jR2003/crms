<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Application Expiry Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #F39C12;">Reminder: Your PWD Application is About to Expire</h2>
        
        <p>Dear {{ $firstName }} {{ $lastName }},</p>
        
        <p>This is a reminder that your PWD application with reference number <strong>{{ $referenceNumber }}</strong> is about to expire.</p>
        
        <div style="background-color: #FFF3CD; border-left: 4px solid #F39C12; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Time Remaining:</strong> Approximately {{ $remainingHours }} hours</p>
            <p style="margin: 5px 0 0 0;"><strong>Expires On:</strong> {{ \Carbon\Carbon::parse($expiresAt)->format('F d, Y h:i A') }}</p>
        </div>
        
        <p>To avoid expiration, please ensure your application is reviewed and processed before the deadline.</p>
        
        <p>You can check your application status at any time using your reference number:</p>
        <p style="text-align: center; margin: 20px 0;">
            <a href="{{ $statusCheckUrl }}" style="background-color: #1976D2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Check Application Status
            </a>
        </p>
        
        <p><strong>Reference Number:</strong> {{ $referenceNumber }}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #666;">
            This is an automated message from Cabuyao PDAO RMS. Please do not reply to this email.
        </p>
    </div>
</body>
</html>

