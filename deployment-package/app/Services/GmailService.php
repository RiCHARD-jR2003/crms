<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Mail\Message;

class GmailService
{
    /**
     * Send an email using Laravel's SMTP Mail
     *
     * @param string $to
     * @param string $subject
     * @param string $body
     * @param string $fromEmail
     * @param string $fromName
     * @return bool
     */
    public function sendEmail($to, $subject, $body, $fromEmail = null, $fromName = null)
    {
        try {
            // Use admin email as default sender
            $fromEmail = $fromEmail ?: config('mail.from.address', 'sarinonhoelivan29@gmail.com');
            $fromName = $fromName ?: config('mail.from.name', 'Cabuyao PDAO RMS');

            Mail::raw($body, function (Message $message) use ($to, $subject, $fromEmail, $fromName) {
                $message->to($to)
                        ->subject($subject)
                        ->from($fromEmail, $fromName);
            });
            
            Log::info('SMTP email sent successfully', [
                'to' => $to,
                'subject' => $subject,
                'from' => $fromEmail
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('SMTP email sending failed', [
                'error' => $e->getMessage(),
                'to' => $to,
                'subject' => $subject,
                'from' => $fromEmail ?? config('mail.from.address', 'sarinonhoelivan29@gmail.com')
            ]);

            return false;
        }
    }

    /**
     * Send an HTML email using Laravel's SMTP Mail
     *
     * @param string $to
     * @param string $subject
     * @param string $htmlBody
     * @param string $fromEmail
     * @param string $fromName
     * @return bool
     */
    public function sendHtmlEmail($to, $subject, $htmlBody, $fromEmail = null, $fromName = null)
    {
        try {
            // Use admin email as default sender
            $fromEmail = $fromEmail ?: config('mail.from.address', 'sarinonhoelivan29@gmail.com');
            $fromName = $fromName ?: config('mail.from.name', 'Cabuyao PDAO RMS');

            Mail::html($htmlBody, function (Message $message) use ($to, $subject, $fromEmail, $fromName) {
                $message->to($to)
                        ->subject($subject)
                        ->from($fromEmail, $fromName);
            });
            
            Log::info('SMTP HTML email sent successfully', [
                'to' => $to,
                'subject' => $subject,
                'from' => $fromEmail
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('SMTP HTML email sending failed', [
                'error' => $e->getMessage(),
                'to' => $to,
                'subject' => $subject,
                'from' => $fromEmail ?? config('mail.from.address', 'sarinonhoelivan29@gmail.com')
            ]);

            return false;
        }
    }

    /**
     * Check if the service is properly configured
     *
     * @return bool
     */
    public function isConfigured()
    {
        return !empty(config('mail.from.address')) && 
               !empty(config('mail.mailer')) &&
               config('mail.mailer') === 'smtp';
    }
}
