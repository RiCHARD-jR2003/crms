<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PWD ID Card Ready for Claiming</title>
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
            background-color: #0b87ac;
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
        .highlight {
            color: #0b87ac;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your PWD ID Card is Ready!</h1>
        </div>

        <div class="content">
            <p>Dear <strong>{{ $fullName }}</strong>,</p>

            <p>We are pleased to inform you that your PWD (Persons with Disabilities) ID card has been processed and is now ready for claiming.</p>

            <div class="info-box">
                <p style="margin: 5px 0;"><strong>PWD ID Number:</strong> {{ $pwdId }}</p>
                <p style="margin: 5px 0;"><strong>Barangay:</strong> {{ $barangay }}</p>
                <p style="margin: 5px 0;"><strong>Claiming Schedule:</strong> {{ $claimingSchedule }}</p>
            </div>

            <div class="instructions-box">
                <h3 style="margin-top: 0; color: #F39C12;">📋 Claiming Instructions:</h3>
                <p style="margin: 5px 0;">{{ $instructions }}</p>
                <p style="margin: 10px 0 5px 0;"><strong>Office Location:</strong> {{ $officeAddress }}</p>
                <p style="margin: 5px 0;"><strong>Contact Number:</strong> {{ $contactNumber }}</p>
            </div>

            <p><strong>Important Reminders:</strong></p>
            <ul>
                <li>Please bring a valid government-issued ID when claiming your PWD ID card.</li>
                <li>Claim your ID card during the specified claiming schedule.</li>
                <li>If you cannot claim in person, you may authorize someone to claim on your behalf with proper authorization documents.</li>
            </ul>

            <p>If you have any questions or concerns, please do not hesitate to contact the PDAO office.</p>

            <p>Thank you for your patience, and we look forward to serving you.</p>

            <p>Best regards,<br>
            <strong>Cabuyao PDAO</strong><br>
            Comprehensive Record Management System (CRMS)</p>
        </div>

        <div class="footer">
            <p>This is an automated notification from the Cabuyao PDAO CRMS.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>

