<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Application Expired</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #E74C3C;">Your PWD Application Has Expired</h2>
        
        <p>Dear {{ $firstName }} {{ $lastName }},</p>
        
        <p>We regret to inform you that your PWD application with reference number <strong>{{ $referenceNumber }}</strong> has expired.</p>
        
        <div style="background-color: #F8D7DA; border-left: 4px solid #E74C3C; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Submission Date:</strong> {{ \Carbon\Carbon::parse($submissionDate)->format('F d, Y') }}</p>
            <p style="margin: 5px 0 0 0;"><strong>Expiry Date:</strong> {{ \Carbon\Carbon::parse($expiryDate)->format('F d, Y h:i A') }}</p>
        </div>
        
        <p>Your application remained in pending status beyond the allowed holding duration and has been automatically marked as expired.</p>
        
        <p>If you wish to reapply, please submit a new application through our system.</p>
        
        <p style="text-align: center; margin: 20px 0;">
            <a href="{{ $statusCheckUrl }}" style="background-color: #1976D2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Application Details
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

