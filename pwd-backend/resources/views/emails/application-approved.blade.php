<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>PWD Application Approved</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #2E86C1;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .highlight {
            background-color: #e8f5e8;
            padding: 15px;
            border-left: 4px solid #28a745;
            margin: 20px 0;
        }
        .credentials {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #2E86C1;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Congratulations!</h1>
        <h2>Your PWD Application Has Been Approved</h2>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $firstName }} {{ $lastName }}</strong>,</p>
        
        <p>We are pleased to inform you that your PWD (Persons with Disabilities) application has been <strong>approved</strong> by the Cabuyao PDAO (Persons with Disabilities Affairs Office).</p>
        
        <div class="highlight">
            <h3>✅ Application Status: APPROVED</h3>
            <p>You are now officially registered as a PWD member in our system.</p>
            <p><strong>Your PWD ID:</strong> {{ $pwdId }}</p>
        </div>
        
        <div class="credentials" style="background-color:#e8f5e8;border-left:4px solid #28a745;">
            <h3>🔐 Set Your Password</h3>
            <p><strong>Email:</strong> {{ $email }}</p>
            <p>For security, please create your own password using the link below.</p>
        </div>
        
        <h3>🚀 What's Next?</h3>
        <ul>
            <li>Access your PWD member dashboard</li>
            <li>View important announcements</li>
            <li>Access support services</li>
            <li>Track your benefits and services</li>
        </ul>
        
        <div style="text-align: center;">
            <a href="{{ $loginUrl }}" class="button">Set Your Password</a>
        </div>
        
        <h3>📞 Need Help?</h3>
        <p>If you have any questions or need assistance, please contact our support team through the support desk in your dashboard.</p>
        
        <p>Thank you for choosing Cabuyao PDAO RMS!</p>
        
        <p>Best regards,<br>
        <strong>Cabuyao PDAO Team</strong><br>
        <em>Email: sarinonhoelivan29@gmail.com</em></p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>Cabuyao PDAO RMS - Empowering Persons with Disabilities</p>
    </div>
</body>
</html>
