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
     * Send application rejection email with reason and reference number
     *
     * @param array $data
     * @return bool
     */
    public function sendApplicationRejectionEmail($data)
    {
        $referenceNumber = $data['referenceNumber'] ?? 'N/A';
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $statusCheckUrl = "{$frontendUrl}/check-status/{$referenceNumber}";
        
        // Build rejection message combining reason and remarks
        $rejectionMessage = "Rejection Reason: " . ($data['rejectionReason'] ?? 'Not specified');
        if (!empty($data['remarks'])) {
            $rejectionMessage .= "\n\nRemarks/Instructions:\n" . $data['remarks'];
        }
        
        $emailData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'referenceNumber' => $referenceNumber,
            'rejectionReason' => $rejectionMessage,
            'statusCheckUrl' => $statusCheckUrl
        ];

        $subject = 'PWD Application Status Update - Rejected';
        $to = $data['email'];

        Log::info('Attempting to send rejection email', [
            'to' => $to,
            'referenceNumber' => $data['referenceNumber']
        ]);

        // Try SMTP first
        try {
            Mail::send('emails.application-rejected', $emailData, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('Application rejection email sent via SMTP', [
                'to' => $to,
                'referenceNumber' => $data['referenceNumber']
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('SMTP failed for rejection email, trying Gmail API', [
                'error' => $e->getMessage(),
                'to' => $to,
                'trace' => $e->getTraceAsString()
            ]);
        }

        // Fallback to Gmail API if SMTP fails
        if ($this->gmailService && $this->gmailService->isConfigured()) {
            try {
                $htmlBody = View::make('emails.application-rejected', $emailData)->render();
                
                if ($this->gmailService->sendEmail($to, $subject, $htmlBody)) {
                    Log::info('Application rejection email sent via Gmail API', [
                        'to' => $to,
                        'referenceNumber' => $data['referenceNumber']
                    ]);
                    return true;
                }
            } catch (\Exception $e) {
                Log::error('Gmail API failed for rejection email', [
                    'error' => $e->getMessage(),
                    'to' => $to
                ]);
            }
        }

        Log::error('Failed to send application rejection email via both SMTP and Gmail API', [
            'to' => $to,
            'referenceNumber' => $data['referenceNumber']
        ]);

        return false;
    }

    /**
     * Send application submission confirmation email with reference number
     *
     * @param array $data
     * @return bool
     */
    public function sendApplicationSubmissionEmail($data)
    {
        $emailData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'referenceNumber' => $data['referenceNumber'],
            'submissionDate' => $data['submissionDate'],
            'statusCheckUrl' => config('app.frontend_url', 'http://localhost:3000') . '/check-application-status'
        ];

        $subject = 'PWD Application Submitted Successfully';
        $to = $data['email'];

        Log::info('Attempting to send submission confirmation email', [
            'to' => $to,
            'referenceNumber' => $data['referenceNumber']
        ]);

        // Try SMTP first
        try {
            Mail::send('emails.application-submitted', $emailData, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('Application submission email sent via SMTP', [
                'to' => $to,
                'referenceNumber' => $data['referenceNumber']
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('SMTP failed for submission email, trying Gmail API', [
                'error' => $e->getMessage(),
                'to' => $to,
                'trace' => $e->getTraceAsString()
            ]);
        }

        // Fallback to Gmail API if SMTP fails
        if ($this->gmailService && $this->gmailService->isConfigured()) {
            try {
                $htmlBody = View::make('emails.application-submitted', $emailData)->render();
                
                if ($this->gmailService->sendEmail($to, $subject, $htmlBody)) {
                    Log::info('Application submission email sent via Gmail API', [
                        'to' => $to,
                        'referenceNumber' => $data['referenceNumber']
                    ]);
                    return true;
                }
            } catch (\Exception $e) {
                Log::error('Gmail API failed for submission email', [
                    'error' => $e->getMessage(),
                    'to' => $to
                ]);
            }
        }

        Log::error('Failed to send application submission email via both SMTP and Gmail API', [
            'to' => $to,
            'referenceNumber' => $data['referenceNumber']
        ]);

        return false;
    }

    /**
     * Send PWD card expiration notification email
     *
     * @param array $data
     * @return bool
     */
    public function sendCardExpirationEmail($data)
    {
        $emailData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'pwdId' => $data['pwdId'],
            'expirationDate' => $data['expirationDate'],
            'daysUntilExpiration' => $data['daysUntilExpiration'] ?? 30,
            'renewalUrl' => $data['renewalUrl'] ?? config('app.frontend_url', 'http://localhost:3000') . '/renewal',
            'loginUrl' => $data['loginUrl'] ?? config('app.frontend_url', 'http://localhost:3000') . '/login',
        ];

        $subject = 'Important: Your PWD ID Card Expires in 30 Days';
        $to = $data['email'];

        Log::info('Attempting to send card expiration email', [
            'to' => $to,
            'pwdId' => $data['pwdId'],
            'expirationDate' => $data['expirationDate']
        ]);

        // Try SMTP first
        try {
            Mail::send('emails.card-expiration-notice', $emailData, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('Card expiration email sent via SMTP', [
                'to' => $to,
                'pwdId' => $data['pwdId']
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('SMTP failed for expiration email, trying Gmail API', [
                'error' => $e->getMessage(),
                'to' => $to,
                'trace' => $e->getTraceAsString()
            ]);
        }

        // Fallback to Gmail API if SMTP fails
        if ($this->gmailService && $this->gmailService->isConfigured()) {
            try {
                $htmlBody = View::make('emails.card-expiration-notice', $emailData)->render();
                
                if ($this->gmailService->sendEmail($to, $subject, $htmlBody)) {
                    Log::info('Card expiration email sent via Gmail API', [
                        'to' => $to,
                        'pwdId' => $data['pwdId']
                    ]);
                    return true;
                }
            } catch (\Exception $e) {
                Log::error('Gmail API failed for expiration email', [
                    'error' => $e->getMessage(),
                    'to' => $to
                ]);
            }
        }

        Log::error('Failed to send card expiration email via both SMTP and Gmail API', [
            'to' => $to,
            'pwdId' => $data['pwdId']
        ]);

        return false;
    }

    /**
     * Send ID renewal approval email
     *
     * @param array $data
     * @return bool
     */
    public function sendRenewalApprovalEmail($data)
    {
        $emailData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'pwdId' => $data['pwdId'],
            'newExpirationDate' => $data['newExpirationDate'],
            'renewalDate' => $data['renewalDate'] ?? now()->format('F d, Y'),
            'notes' => $data['notes'] ?? '',
            'loginUrl' => $data['loginUrl'] ?? config('app.frontend_url', 'http://localhost:3000') . '/login'
        ];

        $subject = 'PWD ID Card Renewal Approved';
        $to = $data['email'];

        Log::info('Attempting to send renewal approval email', [
            'to' => $to,
            'pwdId' => $data['pwdId'],
            'newExpirationDate' => $data['newExpirationDate']
        ]);

        // Try SMTP first
        try {
            Mail::send('emails.renewal-approved', $emailData, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('Renewal approval email sent via SMTP', [
                'to' => $to,
                'pwdId' => $data['pwdId']
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('SMTP failed for renewal approval email, trying Gmail API', [
                'error' => $e->getMessage(),
                'to' => $to,
                'trace' => $e->getTraceAsString()
            ]);
        }

        // Fallback to Gmail API if SMTP fails
        if ($this->gmailService && $this->gmailService->isConfigured()) {
            try {
                $htmlBody = View::make('emails.renewal-approved', $emailData)->render();
                
                if ($this->gmailService->sendEmail($to, $subject, $htmlBody)) {
                    Log::info('Renewal approval email sent via Gmail API', [
                        'to' => $to,
                        'pwdId' => $data['pwdId']
                    ]);
                    return true;
                }
            } catch (\Exception $e) {
                Log::error('Gmail API failed for renewal approval email', [
                    'error' => $e->getMessage(),
                    'to' => $to
                ]);
            }
        }

        Log::error('Failed to send renewal approval email via both SMTP and Gmail API', [
            'to' => $to,
            'pwdId' => $data['pwdId']
        ]);

        return false;
    }

    /**
     * Send application expiry reminder email
     *
     * @param array $data
     * @return bool
     */
    public function sendApplicationExpiryReminderEmail($data)
    {
        $emailData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'referenceNumber' => $data['referenceNumber'],
            'expiresAt' => $data['expiresAt'],
            'remainingHours' => $data['remainingHours'],
            'statusCheckUrl' => config('app.frontend_url', 'http://localhost:3000') . '/check-status/' . $data['referenceNumber'],
        ];

        $subject = 'Reminder: Your PWD Application is About to Expire';
        $to = $data['email'];

        Log::info('Attempting to send expiry reminder email', [
            'to' => $to,
            'referenceNumber' => $data['referenceNumber']
        ]);

        try {
            Mail::send('emails.application-expiry-reminder', $emailData, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('Expiry reminder email sent via SMTP', [
                'to' => $to,
                'referenceNumber' => $data['referenceNumber']
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send expiry reminder email', [
                'error' => $e->getMessage(),
                'to' => $to,
                'referenceNumber' => $data['referenceNumber']
            ]);
            return false;
        }
    }

    /**
     * Send application expiry email
     *
     * @param array $data
     * @return bool
     */
    public function sendApplicationExpiryEmail($data)
    {
        $emailData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'referenceNumber' => $data['referenceNumber'],
            'submissionDate' => $data['submissionDate'],
            'expiryDate' => $data['expiryDate'],
            'statusCheckUrl' => config('app.frontend_url', 'http://localhost:3000') . '/check-status/' . $data['referenceNumber'],
        ];

        $subject = 'Your PWD Application Has Expired';
        $to = $data['email'];

        Log::info('Attempting to send expiry email', [
            'to' => $to,
            'referenceNumber' => $data['referenceNumber']
        ]);

        try {
            Mail::send('emails.application-expired', $emailData, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('Expiry email sent via SMTP', [
                'to' => $to,
                'referenceNumber' => $data['referenceNumber']
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send expiry email', [
                'error' => $e->getMessage(),
                'to' => $to,
                'referenceNumber' => $data['referenceNumber']
            ]);
            return false;
        }
    }

    /**
     * Send application expiry rejection email
     *
     * @param array $data
     * @return bool
     */
    public function sendApplicationExpiryRejectionEmail($data)
    {
        $emailData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'referenceNumber' => $data['referenceNumber'],
            'submissionDate' => $data['submissionDate'],
            'expiryDate' => $data['expiryDate'],
            'statusCheckUrl' => config('app.frontend_url', 'http://localhost:3000') . '/check-status/' . $data['referenceNumber'],
        ];

        $subject = 'Your PWD Application Has Been Rejected - Expired';
        $to = $data['email'];

        Log::info('Attempting to send expiry rejection email', [
            'to' => $to,
            'referenceNumber' => $data['referenceNumber']
        ]);

        try {
            Mail::send('emails.application-expiry-rejected', $emailData, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('Expiry rejection email sent via SMTP', [
                'to' => $to,
                'referenceNumber' => $data['referenceNumber']
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send expiry rejection email', [
                'error' => $e->getMessage(),
                'to' => $to,
                'referenceNumber' => $data['referenceNumber']
            ]);
            return false;
        }
    }

    /**
     * Send admin notification for expired/rejected applications
     *
     * @param array $data
     * @return bool
     */
    public function sendApplicationExpiryAdminNotification($data)
    {
        $emailData = [
            'application' => $data['application'],
            'action' => $data['application']['action'],
            'timestamp' => now()->format('F d, Y h:i A'),
        ];

        $subject = "Application {$data['application']['action']}: {$data['application']['referenceNumber']}";
        $emails = $data['emails'];

        Log::info('Attempting to send admin notification', [
            'emails' => $emails,
            'referenceNumber' => $data['application']['referenceNumber']
        ]);

        try {
            foreach ($emails as $email) {
                Mail::send('emails.application-expiry-admin-notification', $emailData, function ($message) use ($email, $subject) {
                    $message->to($email)
                           ->subject($subject)
                           ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
                });
            }

            Log::info('Admin notification sent', [
                'emails' => $emails,
                'referenceNumber' => $data['application']['referenceNumber']
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification', [
                'error' => $e->getMessage(),
                'emails' => $emails
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

    /**
     * Send ID claiming notification email
     *
     * @param array $data
     * @return bool
     */
    public function sendIDClaimingEmail($data)
    {
        $emailData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'fullName' => trim(($data['firstName'] ?? '') . ' ' . ($data['lastName'] ?? '')),
            'barangay' => $data['barangay'] ?? 'N/A',
            'pwdId' => $data['pwdId'] ?? 'N/A',
            'claimingSchedule' => $data['claimingSchedule'] ?? 'Monday to Friday, 8:00 AM - 5:00 PM',
            'instructions' => $data['instructions'] ?? 'Please bring a valid ID and claim your PWD ID card at the PDAO office.',
            'officeAddress' => $data['officeAddress'] ?? 'PDAO Office, Cabuyao City Hall',
            'contactNumber' => $data['contactNumber'] ?? 'N/A'
        ];

        $subject = 'Your PWD ID Card is Ready for Claiming';
        $to = $data['email'];

        Log::info('Attempting to send ID claiming email', [
            'to' => $to,
            'pwdId' => $data['pwdId'] ?? 'N/A'
        ]);

        try {
            Mail::send('emails.id-claiming', $emailData, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('ID claiming email sent via SMTP', [
                'to' => $to,
                'pwdId' => $data['pwdId'] ?? 'N/A'
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send ID claiming email', [
                'error' => $e->getMessage(),
                'to' => $to,
                'trace' => $e->getTraceAsString()
            ]);

            // Fallback to Gmail API if SMTP fails
            if ($this->gmailService && $this->gmailService->isConfigured()) {
                try {
                    $htmlBody = View::make('emails.id-claiming', $emailData)->render();
                    
                    if ($this->gmailService->sendEmail($to, $subject, $htmlBody)) {
                        Log::info('ID claiming email sent via Gmail API', [
                            'to' => $to,
                            'pwdId' => $data['pwdId'] ?? 'N/A'
                        ]);
                        return true;
                    }
                } catch (\Exception $e2) {
                    Log::error('Gmail API failed for ID claiming email', [
                        'error' => $e2->getMessage(),
                        'to' => $to
                    ]);
                }
            }

            return false;
        }
    }

    /**
     * Send ID renewal reminder email
     *
     * @param array $data
     * @return bool
     */
    public function sendIDRenewalReminderEmail($data)
    {
        $emailData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'fullName' => trim(($data['firstName'] ?? '') . ' ' . ($data['lastName'] ?? '')),
            'barangay' => $data['barangay'] ?? 'N/A',
            'pwdId' => $data['pwdId'] ?? 'N/A',
            'expirationDate' => $data['expirationDate'],
            'daysRemaining' => $data['daysRemaining'],
            'renewalInstructions' => $data['renewalInstructions'] ?? 'Please submit your renewal application with your current PWD ID card and a recent medical certificate at the PDAO office.',
            'officeAddress' => $data['officeAddress'] ?? 'PDAO Office, Cabuyao City Hall',
            'contactNumber' => $data['contactNumber'] ?? 'N/A'
        ];

        $subject = 'PWD ID Card Renewal Reminder - Expiring Soon';
        $to = $data['email'];

        Log::info('Attempting to send ID renewal reminder email', [
            'to' => $to,
            'pwdId' => $data['pwdId'] ?? 'N/A',
            'daysRemaining' => $data['daysRemaining']
        ]);

        try {
            Mail::send('emails.id-renewal-reminder', $emailData, function ($message) use ($to, $subject) {
                $message->to($to)
                       ->subject($subject)
                       ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
            });

            Log::info('ID renewal reminder email sent via SMTP', [
                'to' => $to,
                'pwdId' => $data['pwdId'] ?? 'N/A'
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send ID renewal reminder email', [
                'error' => $e->getMessage(),
                'to' => $to,
                'trace' => $e->getTraceAsString()
            ]);

            // Fallback to Gmail API if SMTP fails
            if ($this->gmailService && $this->gmailService->isConfigured()) {
                try {
                    $htmlBody = View::make('emails.id-renewal-reminder', $emailData)->render();
                    
                    if ($this->gmailService->sendEmail($to, $subject, $htmlBody)) {
                        Log::info('ID renewal reminder email sent via Gmail API', [
                            'to' => $to,
                            'pwdId' => $data['pwdId'] ?? 'N/A'
                        ]);
                        return true;
                    }
                } catch (\Exception $e2) {
                    Log::error('Gmail API failed for ID renewal reminder email', [
                        'error' => $e2->getMessage(),
                        'to' => $to
                    ]);
                }
            }

            return false;
        }
    }

    /**
     * Send admin notification for ID claiming
     *
     * @param array $data
     * @return bool
     */
    public function sendIDClaimingAdminNotification($data)
    {
        $emailData = [
            'applicantName' => $data['applicantName'],
            'barangay' => $data['barangay'] ?? 'N/A',
            'pwdId' => $data['pwdId'] ?? 'N/A',
            'flaggedAt' => $data['flaggedAt'] ?? now()->format('F d, Y h:i A')
        ];

        $subject = "New PWD ID Ready for Claiming: {$data['pwdId']}";
        $emails = $data['adminEmails'] ?? [];

        if (empty($emails)) {
            Log::warning('No admin emails provided for ID claiming notification');
            return false;
        }

        Log::info('Attempting to send ID claiming admin notification', [
            'emails' => $emails,
            'pwdId' => $data['pwdId'] ?? 'N/A'
        ]);

        try {
            foreach ($emails as $email) {
                Mail::send('emails.id-claiming-admin-notification', $emailData, function ($message) use ($email, $subject) {
                    $message->to($email)
                           ->subject($subject)
                           ->from('sarinonhoelivan29@gmail.com', 'Cabuyao PDAO RMS');
                });
            }

            Log::info('ID claiming admin notification sent', [
                'emails' => $emails,
                'pwdId' => $data['pwdId'] ?? 'N/A'
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send ID claiming admin notification', [
                'error' => $e->getMessage(),
                'emails' => $emails
            ]);

            return false;
        }
    }
}
