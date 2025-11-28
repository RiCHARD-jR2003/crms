<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New PWD ID Ready for Claiming</title>
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
            background-color: #27AE60;
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
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E0E0E0;
            text-align: center;
            color: #7F8C8D;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 New PWD ID Ready for Claiming</h1>
        </div>

        <div class="content">
            <p>Dear Admin,</p>

            <p>A new PWD ID card has been processed and is ready for claiming.</p>

            <div class="info-box">
                <p style="margin: 5px 0;"><strong>Applicant Name:</strong> {{ $applicantName }}</p>
                <p style="margin: 5px 0;"><strong>PWD ID Number:</strong> {{ $pwdId }}</p>
                <p style="margin: 5px 0;"><strong>Barangay:</strong> {{ $barangay }}</p>
                <p style="margin: 5px 0;"><strong>Flagged At:</strong> {{ $flaggedAt }}</p>
            </div>

            <p>Please ensure that the applicant has been notified via email about the ID claiming process.</p>

            <p>Best regards,<br>
            <strong>Cabuyao PDAO CRMS</strong></p>
        </div>

        <div class="footer">
            <p>This is an automated notification from the Cabuyao PDAO CRMS.</p>
        </div>
    </div>
</body>
</html>

