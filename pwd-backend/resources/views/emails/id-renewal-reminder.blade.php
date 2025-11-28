<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PWD ID Card Renewal Reminder</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #E74C3C;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 20px -30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin: 20px 0;
        }
        .warning-box {
            background-color: #FDEDEC;
            border-left: 4px solid #E74C3C;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box strong {
            color: #E74C3C;
        }
        .info-box {
            background-color: #E8F4FD;
            border-left: 4px solid #0b87ac;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box strong {
            color: #0b87ac;
        }
        .instructions-box {
            background-color: #FEF5E7;
            border-left: 4px solid #F39C12;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E0E0E0;
            text-align: center;
            color: #7F8C8D;
            font-size: 12px;
        }
        .days-remaining {
            font-size: 32px;
            font-weight: bold;
            color: #E74C3C;
            text-align: center;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ PWD ID Card Renewal Reminder</h1>
        </div>

        <div class="content">
            <p>Dear <strong>{{ $fullName }}</strong>,</p>

            <p>This is a reminder that your PWD (Persons with Disabilities) ID card will expire soon.</p>

            <div class="warning-box">
                <div class="days-remaining">{{ $daysRemaining }} Days Remaining</div>
                <p style="text-align: center; margin: 10px 0 5px 0;"><strong>Expiration Date:</strong> {{ \Carbon\Carbon::parse($expirationDate)->format('F d, Y') }}</p>
            </div>

            <div class="info-box">
                <p style="margin: 5px 0;"><strong>PWD ID Number:</strong> {{ $pwdId }}</p>
                <p style="margin: 5px 0;"><strong>Barangay:</strong> {{ $barangay }}</p>
            </div>

            <div class="instructions-box">
                <h3 style="margin-top: 0; color: #F39C12;">📋 Renewal Instructions:</h3>
                <p style="margin: 5px 0;">{{ $renewalInstructions }}</p>
                <p style="margin: 10px 0 5px 0;"><strong>Office Location:</strong> {{ $officeAddress }}</p>
                <p style="margin: 5px 0;"><strong>Contact Number:</strong> {{ $contactNumber }}</p>
            </div>

            <p><strong>Required Documents for Renewal:</strong></p>
            <ul>
                <li>Current/Expiring PWD ID Card</li>
                <li>Recent Medical Certificate (not older than 6 months)</li>
                <li>Valid Government-issued ID</li>
                <li>2x2 ID Picture (if needed)</li>
            </ul>

            <p><strong>Important:</strong> Please renew your PWD ID card before the expiration date to avoid any interruption in availing PWD benefits and privileges.</p>

            <p>If you have any questions or need assistance with the renewal process, please contact the PDAO office.</p>

            <p>Thank you for your attention to this matter.</p>

            <p>Best regards,<br>
            <strong>Cabuyao PDAO</strong><br>
            Comprehensive Record Management System (CRMS)</p>
        </div>

        <div class="footer">
            <p>This is an automated reminder from the Cabuyao PDAO CRMS.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>

