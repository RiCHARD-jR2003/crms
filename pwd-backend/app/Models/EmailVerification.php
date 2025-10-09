<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class EmailVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'verification_code',
        'expires_at',
        'is_used',
        'purpose'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean'
    ];

    /**
     * Generate a 6-digit verification code
     */
    public static function generateCode()
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create a new verification record
     */
    public static function createVerification($email, $purpose = 'application_submission')
    {
        // Clean up old verifications for this email and purpose
        self::where('email', $email)
            ->where('purpose', $purpose)
            ->where('expires_at', '<', now())
            ->delete();

        return self::create([
            'email' => $email,
            'verification_code' => self::generateCode(),
            'expires_at' => now()->addMinutes(10), // 10 minutes expiry
            'purpose' => $purpose
        ]);
    }

    /**
     * Verify a code
     */
    public static function verifyCode($email, $code, $purpose = 'application_submission')
    {
        $verification = self::where('email', $email)
            ->where('verification_code', $code)
            ->where('purpose', $purpose)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if ($verification) {
            $verification->update(['is_used' => true]);
            return true;
        }

        return false;
    }

    /**
     * Check if verification is expired
     */
    public function isExpired()
    {
        return $this->expires_at < now();
    }
}
