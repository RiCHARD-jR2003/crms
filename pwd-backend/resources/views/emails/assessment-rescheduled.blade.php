<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assessment Rescheduled Successfully</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #27AE60, #1E8449); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .footer { background: #2C3E50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
        .button { display: inline-block; background: #0b87ac; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #065a75; }
        .success-box { background: #EAFAF1; border-left: 4px solid #27AE60; padding: 15px; margin: 20px 0; }
        .info-box { background: #E8F4FD; border-left: 4px solid #0b87ac; padding: 15px; margin: 20px 0; }
        .warning-box { background: #FEF9E7; border-left: 4px solid #F39C12; padding: 15px; margin: 20px 0; }
        .reference { font-size: 24px; font-weight: bold; color: #0b87ac; background: #E8F4FD; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px 0; }
        h1 { margin: 0; font-size: 24px; }
        h2 { color: #27AE60; }
        .schedule-details { background: #fff; border: 2px solid #27AE60; border-radius: 5px; padding: 20px; margin: 15px 0; }
        .schedule-details h3 { margin-top: 0; color: #27AE60; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Assessment Rescheduled Successfully</h1>
        <p>Cabuyao PDAO - PWD Registration System</p>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $assessment->applicant_name }}</strong>,</p>
        
        <div class="success-box">
            <h2>📅 Your New Appointment is Confirmed</h2>
            <p>Your disability assessment has been successfully rescheduled. Please note your new appointment details below.</p>
        </div>
        
        <p>Your Assessment Reference Number:</p>
        <div class="reference">{{ $assessment->reference_number }}</div>
        
        <div class="schedule-details">
            <h3>📅 New Appointment Schedule</h3>
            <p><strong>Date:</strong> {{ $newDate }}</p>
            <p><strong>Time:</strong> {{ $timeSlot }}</p>
            <p><strong>Location:</strong> Cabuyao PDAO Office, City Hall Complex</p>
        </div>
        
        @if($originalDate && $originalDate != $newDate)
        <div class="info-box">
            <p><strong>Original Scheduled Date:</strong> {{ $originalDate }}</p>
            <p>This appointment has been rescheduled from your original date.</p>
        </div>
        @endif
        
        <div class="warning-box">
            <h3>⚠️ Important Reminders</h3>
            <ul>
                <li><strong>Please arrive on time.</strong> Your appointment slot is reserved for you.</li>
                <li><strong>This is your rescheduled appointment.</strong> Further rescheduling may not be available.</li>
                <li>If you cannot attend, please contact the PDAO office as soon as possible.</li>
            </ul>
        </div>
        
        <h3>📝 What to Bring:</h3>
        <ul>
            <li>Valid ID</li>
            <li>Medical Certificate (if available)</li>
            <li>Previous medical records related to your disability</li>
        </ul>
        
        <center>
            <a href="{{ $formLink }}" class="button">📋 Complete Assessment Form</a>
        </center>
        
        <h3>📍 Assessment Location:</h3>
        <p>
            Cabuyao PDAO Office<br>
            City Hall Complex, Cabuyao, Laguna<br>
            <strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM
        </p>
        
        <p>If you have any questions, please contact us at <strong>pdao@cabuyao.gov.ph</strong> or call <strong>(02) XXXX-XXXX</strong>.</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from the Cabuyao PDAO PWD Registration System.</p>
        <p>Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} City of Cabuyao - Persons with Disability Affairs Office</p>
    </div>
</body>
</html>

