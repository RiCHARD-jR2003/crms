<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assessment Scheduled</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #27AE60, #1E8449); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .footer { background: #2C3E50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
        .button { display: inline-block; background: #0b87ac; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .schedule-box { background: #D5F5E3; border: 2px solid #27AE60; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
        .date { font-size: 28px; font-weight: bold; color: #27AE60; }
        .time { font-size: 20px; color: #2C3E50; margin-top: 10px; }
        .reference { font-size: 18px; font-weight: bold; color: #0b87ac; background: #E8F4FD; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .warning { background: #FCF3CF; border-left: 4px solid #F39C12; padding: 15px; margin: 20px 0; }
        h1 { margin: 0; font-size: 24px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Assessment Scheduled Successfully!</h1>
        <p>Your disability assessment appointment has been confirmed</p>
    </div>
    
    <div class="content">
        <p>Dear <strong><?php echo e($assessment->applicant_name); ?></strong>,</p>
        
        <p>Your disability assessment has been successfully scheduled. Please review the details below:</p>
        
        <div class="schedule-box">
            <p>📅 <strong>ASSESSMENT DATE</strong></p>
            <div class="date"><?php echo e(\Carbon\Carbon::parse($assessment->assessment_date)->format('F d, Y')); ?></div>
            <div class="time">🕐 <?php echo e($timeSlot); ?></div>
        </div>
        
        <p>Reference Number: <span class="reference"><?php echo e($assessment->reference_number); ?></span></p>
        
        <h3>📝 Complete Your Assessment Form</h3>
        <p>Before your appointment, please complete the online disability assessment form:</p>
        
        <center>
            <a href="<?php echo e($formLink); ?>" class="button">📋 Complete Assessment Form</a>
        </center>
        
        <div class="warning">
            <strong>⚠️ Important Reminders:</strong>
            <ul>
                <li>Please arrive 15 minutes before your scheduled time</li>
                <li>Bring a valid ID and any medical documents</li>
                <li>Complete the online form before your appointment if possible</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
            </ul>
        </div>
        
        <h3>📍 Location:</h3>
        <p>
            <strong>Cabuyao PDAO Office</strong><br>
            City Hall Complex, Cabuyao, Laguna
        </p>
        
        <p>If you have any questions or need to reschedule, please contact us at <strong>pdao@cabuyao.gov.ph</strong>.</p>
        
        <p>Thank you for your cooperation!</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from the Cabuyao PDAO PWD Registration System.</p>
        <p>&copy; <?php echo e(date('Y')); ?> City of Cabuyao - Persons with Disability Affairs Office</p>
    </div>
</body>
</html>

<?php /**PATH C:\Users\Ivan\Desktop\HAHA\crms\pwd-backend\resources\views/emails/assessment-scheduled.blade.php ENDPATH**/ ?>