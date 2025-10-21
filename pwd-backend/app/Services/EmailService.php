<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;

class EmailService
{
    private $gmailService;

    public function __construct()
    {
        // Only initialize Gmail service if Google API is available
        try {
            $this->gmailService = new GmailService();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Gmail service not available, using SMTP only', [
                'error' => $e->getMessage()
            ]);
            $this->gmailService = null;
        }
    }

    /**
     * Send application approval email with login credentials
     *
     * @param array $data
     * @return bool
     */
    public function sendApplicationApprovalEmail($data)
    {
        $emailData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email'],
            'username' => $data['username'],
            'password' => $data['password'],
            'pwdId' => $data['pwdId'],
            'loginUrl' => $data['loginUrl'] ?? config('app.frontend_url', 'http://localhost:3000/login')
        ];

        $subject = 'PWD Application Approved - Account Created';
        $to = $data['email']; // This is the applicant's email address

        Log::info('Attempting to send approval email', [
            'to' => $to,
            'pwdId' => $data['pwdId'],
            'gmail_service_available' => $this->gmailService !== null,
            'gmail_configured' => $this->gmailService ? $this->gmailService->isConfigured() : false,
            'client_id_set' => !empty(config('services.google.client_id')),
            'client_secret_set' => !empty(config('services.google.client_secret')),
            'refresh_token_set' => !empty(config('services.google.refresh_token'))
        ]);

        // Try SMTP first (more reliable for now)
        try {
            Log::info('Attempting SMTP send', [
                'to' => $to,
                'subject' => $subject
            ]);

            Mail::send('emails.application-approved', $emailData, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('Application approval email sent via SMTP', [
                'to' => $to,
                'pwdId' => $data['pwdId'],
                'from' => 'sarinonhoelivan29@gmail.com'
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('SMTP failed, trying Gmail API', [
                'error' => $e->getMessage(),
                'to' => $to,
                'trace' => $e->getTraceAsString()
            ]);
        }

        // Fallback to Gmail API if SMTP fails
        if ($this->gmailService && $this->gmailService->isConfigured()) {
            try {
                $htmlBody = View::make('emails.application-approved', $emailData)->render();
                
                Log::info('Attempting Gmail API send', [
                    'to' => $to,
                    'subject' => $subject,
                    'body_length' => strlen($htmlBody)
                ]);
                
                if ($this->gmailService->sendEmail($to, $subject, $htmlBody)) {
                    Log::info('Application approval email sent via Gmail API', [
                        'to' => $to,
                        'pwdId' => $data['pwdId'],
                        'from' => 'sarinonhoelivan29@gmail.com'
                    ]);
                    return true;
                } else {
                    Log::warning('Gmail API send returned false', [
                        'to' => $to,
                        'pwdId' => $data['pwdId']
                    ]);
                }
            } catch (\Exception $e) {
                Log::warning('Gmail API failed', [
                    'error' => $e->getMessage(),
                    'to' => $to,
                    'trace' => $e->getTraceAsString()
                ]);
            }
        } else {
            Log::warning('Gmail API not configured', [
                'to' => $to,
                'client_id_set' => !empty(config('services.google.client_id')),
                'client_secret_set' => !empty(config('services.google.client_secret')),
                'refresh_token_set' => !empty(config('services.google.refresh_token'))
            ]);
        }

        Log::error('Failed to send application approval email via both SMTP and Gmail API', [
            'to' => $to,
            'pwdId' => $data['pwdId']
        ]);

        return false;
    }

    /**
     * Send a generic email
     *
     * @param string $to
     * @param string $subject
     * @param string $template
     * @param array $data
     * @return bool
     */
    public function sendEmail($to, $subject, $template, $data = [])
    {
        // Try Gmail API first if configured
        if ($this->gmailService->isConfigured()) {
            try {
                $htmlBody = View::make($template, $data)->render();
                
                if ($this->gmailService->sendEmail($to, $subject, $htmlBody)) {
                    Log::info('Email sent via Gmail API', [
                        'to' => $to,
                        'subject' => $subject,
                        'from' => 'sarinonhoelivan29@gmail.com'
                    ]);
                    return true;
                }
            } catch (\Exception $e) {
                Log::warning('Gmail API failed, falling back to SMTP', [
                    'error' => $e->getMessage(),
                    'to' => $to
                ]);
            }
        }

        // Fallback to regular SMTP
        try {
            Mail::send($template, $data, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('Email sent via SMTP', [
                'to' => $to,
                'subject' => $subject,
                'from' => 'sarinonhoelivan29@gmail.com'
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to send email', [
                'error' => $e->getMessage(),
                'to' => $to,
                'subject' => $subject
            ]);

            return false;
        }
    }

    /**
     * Send document correction request email
     *
     * @param string $email
     * @param string $applicantName
     * @param array $documentsToCorrect
     * @param string $notes
     * @param string $correctionToken
     * @return bool
     */
    public static function sendCorrectionRequestEmail($email, $applicantName, $documentsToCorrect, $notes, $correctionToken)
    {
        $emailData = [
            'applicantName' => $applicantName,
            'documentsToCorrect' => $documentsToCorrect,
            'notes' => $notes,
            'correctionUrl' => config('app.frontend_url', 'http://localhost:3000') . '/document-correction/' . $correctionToken,
            'expiryDays' => 7
        ];

        $subject = 'Document Correction Required - PWD Application';
        $to = $email;

        Log::info('Attempting to send correction request email', [
            'to' => $to,
            'applicantName' => $applicantName,
            'documentsCount' => count($documentsToCorrect)
        ]);

        // Try SMTP first
        try {
            Mail::send('emails.document-correction-request', $emailData, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('Document correction request email sent via SMTP', [
                'to' => $to,
                'applicantName' => $applicantName
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to send document correction request email', [
                'error' => $e->getMessage(),
                'to' => $to,
                'applicantName' => $applicantName
            ]);

            return false;
        }
    }

    /**
     * Get Gmail service instance for OAuth operations
     *
     * @return GmailService
     */
    public function getGmailService()
    {
        return $this->gmailService;
    }
}
