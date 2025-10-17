<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GmailController extends Controller
{
    private $emailService;

    public function __construct()
    {
        $this->emailService = new EmailService();
    }

    /**
     * Get Gmail OAuth authorization URL
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAuthUrl()
    {
        try {
            $gmailService = $this->emailService->getGmailService();
            $authUrl = $gmailService->getAuthUrl();

            return response()->json([
                'auth_url' => $authUrl,
                'message' => 'Please visit this URL to authorize Gmail API access for sarinonhoelivan29@gmail.com',
                'admin_email' => 'sarinonhoelivan29@gmail.com'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get Gmail auth URL', ['error' => $e->getMessage()]);
            
            return response()->json([
                'error' => 'Failed to generate authorization URL',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle OAuth callback and store refresh token
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleCallback(Request $request)
    {
        try {
            $code = $request->input('code');
            
            if (!$code) {
                return response()->json([
                    'error' => 'Authorization code is required'
                ], 400);
            }

            $gmailService = $this->emailService->getGmailService();
            $accessToken = $gmailService->getAccessToken($code);

            // Store the refresh token in environment or database
            // For now, we'll return it so it can be added to .env
            return response()->json([
                'message' => 'Gmail API authorization successful for sarinonhoelivan29@gmail.com',
                'refresh_token' => $accessToken['refresh_token'] ?? null,
                'access_token' => $accessToken['access_token'] ?? null,
                'expires_in' => $accessToken['expires_in'] ?? null,
                'admin_email' => 'sarinonhoelivan29@gmail.com',
                'instructions' => 'Add the refresh_token to your .env file as GOOGLE_REFRESH_TOKEN'
            ]);

        } catch (\Exception $e) {
            Log::error('Gmail OAuth callback failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'error' => 'Authorization failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test Gmail API connection
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function testConnection()
    {
        try {
            $gmailService = $this->emailService->getGmailService();
            
            if (!$gmailService->isConfigured()) {
                return response()->json([
                    'status' => 'not_configured',
                    'message' => 'Gmail API is not properly configured. Please set up OAuth credentials.',
                    'admin_email' => 'sarinonhoelivan29@gmail.com'
                ], 400);
            }

            // Try to send a test email
            $testEmail = 'sarinonhoelivan29@gmail.com'; // Send test to admin email
            $subject = 'Gmail API Test - ' . now()->format('Y-m-d H:i:s');
            $body = '<h1>Gmail API Test</h1><p>This is a test email sent via Gmail API at ' . now()->toISOString() . '</p><p>From: sarinonhoelivan29@gmail.com</p>';

            if ($gmailService->sendEmail($testEmail, $subject, $body)) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Gmail API test email sent successfully to sarinonhoelivan29@gmail.com',
                    'admin_email' => 'sarinonhoelivan29@gmail.com'
                ]);
            } else {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Failed to send test email via Gmail API',
                    'admin_email' => 'sarinonhoelivan29@gmail.com'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Gmail API test failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gmail API test failed: ' . $e->getMessage(),
                'admin_email' => 'sarinonhoelivan29@gmail.com'
            ], 500);
        }
    }

    /**
     * Get Gmail API configuration status
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStatus()
    {
        try {
            $gmailService = $this->emailService->getGmailService();
            
            return response()->json([
                'configured' => $gmailService->isConfigured(),
                'client_id_set' => !empty(config('services.google.client_id')),
                'client_secret_set' => !empty(config('services.google.client_secret')),
                'refresh_token_set' => !empty(config('services.google.refresh_token')),
                'redirect_uri' => config('services.google.redirect_uri'),
                'admin_email' => 'sarinonhoelivan29@gmail.com'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get Gmail status', ['error' => $e->getMessage()]);
            
            return response()->json([
                'error' => 'Failed to get Gmail status',
                'message' => $e->getMessage(),
                'admin_email' => 'sarinonhoelivan29@gmail.com'
            ], 500);
        }
    }
}
