<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Application {{ $action }} Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #E74C3C;">Application {{ $action }} - System Notification</h2>
        
        <p>Dear Administrator,</p>
        
        <p>An application has been automatically {{ strtolower($action) }} by the system due to pending duration expiry.</p>
        
        <div style="background-color: #F8F9FA; border: 1px solid #DEE2E6; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Application Details</h3>
            <p style="margin: 5px 0;"><strong>Reference Number:</strong> {{ $application['referenceNumber'] }}</p>
            <p style="margin: 5px 0;"><strong>Applicant Name:</strong> {{ $application['firstName'] }} {{ $application['lastName'] }}</p>
            <p style="margin: 5px 0;"><strong>Barangay:</strong> {{ $application['barangay'] }}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{ $application['email'] }}</p>
            <p style="margin: 5px 0;"><strong>Submission Date:</strong> {{ \Carbon\Carbon::parse($application['submissionDate'])->format('F d, Y') }}</p>
            <p style="margin: 5px 0;"><strong>Expiry Date:</strong> {{ \Carbon\Carbon::parse($application['expiryDate'])->format('F d, Y h:i A') }}</p>
            <p style="margin: 5px 0;"><strong>Previous Status:</strong> {{ $application['previousStatus'] }}</p>
            <p style="margin: 5px 0;"><strong>New Status:</strong> {{ $application['newStatus'] }}</p>
            <p style="margin: 5px 0;"><strong>Action Taken:</strong> {{ $action }}</p>
            <p style="margin: 5px 0;"><strong>Timestamp:</strong> {{ $timestamp }}</p>
        </div>
        
        <p>This action was performed automatically by the system based on the pending registration policy settings.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #666;">
            This is an automated notification from Cabuyao PDAO RMS.
        </p>
    </div>
</body>
</html>

