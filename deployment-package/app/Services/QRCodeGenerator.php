<?php

namespace App\Services;

use App\Models\PWDMember;
use Illuminate\Support\Facades\Log;

class QRCodeGenerator
{
    /**
     * Generate QR code data for a PWD member
     *
     * @param PWDMember $pwdMember
     * @return string JSON encoded QR code data
     */
    public static function generateQRData(PWDMember $pwdMember): string
    {
        try {
            // Get barangay from application
            $application = $pwdMember->applications()->where('status', 'Approved')->first();
            $barangay = $application ? $application->barangay : 'Unknown';
            $emergencyContact = $application ? $application->emergencyContact : null;
            
            $qrData = [
                'pwdId' => $pwdMember->id,
                'userID' => $pwdMember->userID,
                'pwd_id' => $pwdMember->pwd_id,
                'name' => trim($pwdMember->firstName . ' ' . $pwdMember->lastName),
                'firstName' => $pwdMember->firstName,
                'middleName' => $pwdMember->middleName ?? '',
                'lastName' => $pwdMember->lastName,
                'birthDate' => $pwdMember->birthDate ? $pwdMember->birthDate->format('Y-m-d') : null,
                'barangay' => $barangay,
                'disabilityType' => $pwdMember->disabilityType,
                'contactNumber' => $pwdMember->contactNumber,
                'emergencyContact' => $emergencyContact,
                'issuedDate' => now()->toISOString(),
                'validUntil' => now()->addYear()->toISOString(), // 1 year validity
                'qrVersion' => '1.0' // For future compatibility
            ];
            
            return json_encode($qrData, JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            Log::error('QR Code generation failed: ' . $e->getMessage());
            throw new \Exception('Failed to generate QR code data');
        }
    }
    
    /**
     * Generate and store QR code data for a PWD member
     *
     * @param PWDMember $pwdMember
     * @return string The generated QR code data
     */
    public static function generateAndStore(PWDMember $pwdMember): string
    {
        try {
            $qrData = self::generateQRData($pwdMember);
            
            // Update the PWD member with QR code data
            $pwdMember->update([
                'qr_code_data' => $qrData,
                'qr_code_generated_at' => now()
            ]);
            
            Log::info("QR code generated for PWD member: {$pwdMember->pwd_id}");
            
            return $qrData;
            
        } catch (\Exception $e) {
            Log::error('QR Code storage failed: ' . $e->getMessage());
            throw new \Exception('Failed to generate and store QR code');
        }
    }
    
    /**
     * Validate QR code data
     *
     * @param string $qrData
     * @return bool
     */
    public static function validateQRData(string $qrData): bool
    {
        try {
            $data = json_decode($qrData, true);
            
            if (!$data || !is_array($data)) {
                return false;
            }
            
            // Check required fields
            $requiredFields = ['pwdId', 'userID', 'pwd_id', 'firstName', 'lastName'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return false;
                }
            }
            
            // Check validity period
            if (isset($data['validUntil'])) {
                $validUntil = new \DateTime($data['validUntil']);
                if ($validUntil < now()) {
                    return false;
                }
            }
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('QR Code validation failed: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get QR code data for a PWD member
     *
     * @param PWDMember $pwdMember
     * @return string|null
     */
    public static function getQRData(PWDMember $pwdMember): ?string
    {
        return $pwdMember->qr_code_data;
    }
    
    /**
     * Check if QR code exists for a PWD member
     *
     * @param PWDMember $pwdMember
     * @return bool
     */
    public static function hasQRCode(PWDMember $pwdMember): bool
    {
        return !empty($pwdMember->qr_code_data) && !empty($pwdMember->qr_code_generated_at);
    }
}
