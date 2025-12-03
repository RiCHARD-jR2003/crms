<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Disability Assessment Scheduling</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0b87ac, #065a75); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .footer { background: #2C3E50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
        .button { display: inline-block; background: #27AE60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #219A52; }
        .info-box { background: #E8F4FD; border-left: 4px solid #0b87ac; padding: 15px; margin: 20px 0; }
        .reference { font-size: 24px; font-weight: bold; color: #0b87ac; background: #E8F4FD; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px 0; }
        h1 { margin: 0; font-size: 24px; }
        h2 { color: #0b87ac; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 Disability Assessment Scheduling</h1>
        <p>Cabuyao PDAO - PWD Registration System</p>
    </div>
    
    <div class="content">
        <p>Dear <strong><?php echo e($assessment->applicant_name); ?></strong>,</p>
        
        <p>Congratulations! Your PWD application has been approved by your Barangay and is now moving to the next stage.</p>
        
        <div class="info-box">
            <h2>📋 Next Step: Disability Assessment</h2>
            <p>You are required to undergo a <strong>Disability Assessment</strong> as part of the PWD registration process. This assessment will help us better understand your needs and provide appropriate support.</p>
        </div>
        
        <p>Your Assessment Reference Number:</p>
        <div class="reference"><?php echo e($assessment->reference_number); ?></div>
        
        <h3>What You Need To Do:</h3>
        <ol>
            <li>Click the button below to schedule your assessment appointment</li>
            <li>Choose an available date and time slot (maximum 10 appointments per day)</li>
            <li>Complete the disability assessment form online</li>
            <li>Attend your scheduled assessment at the PDAO office</li>
        </ol>
        
        <center>
            <a href="<?php echo e($scheduleLink); ?>" class="button">📅 Schedule My Assessment</a>
        </center>
        
        <p>Or copy and paste this link in your browser:<br>
        <small><?php echo e($scheduleLink); ?></small></p>
        
        <h3>📍 Assessment Location:</h3>
        <p>
            Cabuyao PDAO Office<br>
            City Hall Complex, Cabuyao, Laguna<br>
            <strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM
        </p>
        
        <h3>📝 What to Bring:</h3>
        <ul>
            <li>Valid ID</li>
            <li>Medical Certificate (if available)</li>
            <li>Previous medical records related to your disability</li>
        </ul>
        
        <p>If you have any questions, please contact us at <strong>pdao@cabuyao.gov.ph</strong> or call <strong>(02) XXXX-XXXX</strong>.</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from the Cabuyao PDAO PWD Registration System.</p>
        <p>Please do not reply to this email.</p>
        <p>&copy; <?php echo e(date('Y')); ?> City of Cabuyao - Persons with Disability Affairs Office</p>
    </div>
</body>
</html>

<?php /**PATH C:\Users\richa\Desktop\crms-revised\pwd-backend\resources\views/emails/assessment-invite.blade.php ENDPATH**/ ?>