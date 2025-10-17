<?php

namespace App\Services;

use App\Models\PWDMember;
use Carbon\Carbon;

class PWDIdGenerator
{
    /**
     * Generate a unique PWD ID
     * Format: PWD-YYYY-NNNNNN
     * Where YYYY is the current year and NNNNNN is a 6-digit sequential number
     */
    public static function generate(): string
    {
        $currentYear = Carbon::now()->year;
        $prefix = "PWD-{$currentYear}-";
        
        // Get the highest existing PWD ID for this year
        $lastPwdId = PWDMember::where('pwd_id', 'like', $prefix . '%')
            ->orderBy('pwd_id', 'desc')
            ->value('pwd_id');
        
        if ($lastPwdId) {
            // Extract the number part and increment it
            $numberPart = substr($lastPwdId, strlen($prefix));
            $nextNumber = (int)$numberPart + 1;
        } else {
            // First PWD ID for this year
            $nextNumber = 1;
        }
        
        // Format with leading zeros (6 digits)
        $formattedNumber = str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
        
        return $prefix . $formattedNumber;
    }
    
    /**
     * Validate PWD ID format
     */
    public static function isValid(string $pwdId): bool
    {
        // Pattern: PWD-YYYY-NNNNNN
        $pattern = '/^PWD-\d{4}-\d{6}$/';
        return preg_match($pattern, $pwdId) === 1;
    }
    
    /**
     * Extract year from PWD ID
     */
    public static function extractYear(string $pwdId): ?int
    {
        if (!self::isValid($pwdId)) {
            return null;
        }
        
        preg_match('/^PWD-(\d{4})-\d{6}$/', $pwdId, $matches);
        return isset($matches[1]) ? (int)$matches[1] : null;
    }
    
    /**
     * Extract sequential number from PWD ID
     */
    public static function extractNumber(string $pwdId): ?int
    {
        if (!self::isValid($pwdId)) {
            return null;
        }
        
        preg_match('/^PWD-\d{4}-(\d{6})$/', $pwdId, $matches);
        return isset($matches[1]) ? (int)$matches[1] : null;
    }
}
