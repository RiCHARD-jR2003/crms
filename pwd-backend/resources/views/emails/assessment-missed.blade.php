<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Missed Disability Assessment Appointment</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #E74C3C, #C0392B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .footer { background: #2C3E50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
        .button { display: inline-block; background: #27AE60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #219A52; }
        .button-disabled { display: inline-block; background: #95a5a6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .warning-box { background: #FDEDEC; border-left: 4px solid #E74C3C; padding: 15px; margin: 20px 0; }
        .info-box { background: #E8F4FD; border-left: 4px solid #0b87ac; padding: 15px; margin: 20px 0; }
        .reference { font-size: 24px; font-weight: bold; color: #0b87ac; background: #E8F4FD; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px 0; }
        h1 { margin: 0; font-size: 24px; }
        h2 { color: #E74C3C; }
        .missed-details { background: #fff; border: 1px solid #E74C3C; border-radius: 5px; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚠️ Missed Assessment Appointment</h1>
        <p>Cabuyao PDAO - PWD Registration System</p>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $assessment->applicant_name }}</strong>,</p>
        
        <div class="warning-box">
            <h2>📅 You Missed Your Scheduled Appointment</h2>
            <p>Our records indicate that you did not appear for your scheduled disability assessment appointment.</p>
        </div>
        
        <div class="missed-details">
            <p><strong>Reference Number:</strong> {{ $assessment->reference_number }}</p>
            <p><strong>Scheduled Date:</strong> {{ $missedDate }}</p>
            <p><strong>Scheduled Time:</strong> {{ $missedTime }}</p>
        </div>
        
        @if($canReschedule && $rescheduleLink)
        <div class="info-box">
            <h3>✅ You Can Still Reschedule</h3>
            <p>You are allowed to reschedule your appointment <strong>ONE TIME ONLY</strong>. Please click the button below to select a new date and time.</p>
            <p><strong>Important:</strong> This rescheduling opportunity will expire in 7 days. After that, you will need to contact the PDAO office directly.</p>
        </div>
        
        <center>
            <a href="{{ $rescheduleLink }}" class="button">📅 Reschedule My Assessment</a>
        </center>
        
        <p>Or copy and paste this link in your browser:<br>
        <small>{{ $rescheduleLink }}</small></p>
        @else
        <div class="warning-box">
            <h3>❌ Rescheduling Opportunity Used</h3>
            <p>You have already used your one-time rescheduling opportunity. Please contact the PDAO office directly to discuss your options.</p>
            <center>
                <span class="button-disabled">Rescheduling Not Available</span>
            </center>
        </div>
        @endif
        
        <h3>📍 Contact Information:</h3>
        <p>
            Cabuyao PDAO Office<br>
            City Hall Complex, Cabuyao, Laguna<br>
            <strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM<br>
            <strong>Email:</strong> pdao@cabuyao.gov.ph<br>
            <strong>Phone:</strong> (02) XXXX-XXXX
        </p>
        
        <p>Please contact us if you have a valid reason for missing your appointment or need assistance.</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from the Cabuyao PDAO PWD Registration System.</p>
        <p>Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} City of Cabuyao - Persons with Disability Affairs Office</p>
    </div>
</body>
</html>

