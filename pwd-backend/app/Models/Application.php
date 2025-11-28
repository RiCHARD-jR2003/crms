<?php
// app/Models/Application.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $table = 'application';
    protected $primaryKey = 'applicationID';
    
    protected $fillable = [
        'referenceNumber',
        'pwdID',
        'firstName',
        'lastName',
        'middleName',
        'suffix',
        'birthDate',
        'gender',
        'civilStatus',
        'nationality',
        'disabilityType',
        'disabilityCause',
        'disabilityDate',
        'address',
        'barangay',
        'city',
        'province',
        'postalCode',
        'email',
        'contactNumber',
        'emergencyContact',
        'emergencyPhone',
        'emergencyRelationship',
        'idType',
        'idNumber',
        'medicalCertificate',
        'clinicalAbstract',
        'voterCertificate',
        'idPictures',
        'birthCertificate',
        'wholeBodyPicture',
        'affidavit',
        'barangayCertificate',
        'submissionDate',
        'status',
        'remarks',
        'expires_at',
        'reminder_sent'
    ];

    protected $casts = [
        'submissionDate' => 'date',
        'birthDate' => 'date',
        'disabilityDate' => 'date',
        'status' => 'string',
        'expires_at' => 'datetime',
        'reminder_sent' => 'boolean'
    ];

    // Relationships
    public function pwdMember()
    {
        return $this->belongsTo(PWDMember::class, 'pwdID', 'userID');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'Approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'Rejected');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'Expired');
    }

    /**
     * Check if application is expired
     */
    public function isExpired()
    {
        if ($this->status === 'Expired') {
            return true;
        }

        if ($this->expires_at && now()->greaterThan($this->expires_at)) {
            return true;
        }

        return false;
    }

    /**
     * Get remaining time until expiry
     */
    public function getRemainingTime()
    {
        if (!$this->expires_at) {
            return null;
        }

        if ($this->isExpired()) {
            return 0;
        }

        return now()->diffInSeconds($this->expires_at);
    }

    /**
     * Calculate and set expiry date based on holding duration
     */
    public function calculateExpiryDate()
    {
        try {
            $holdingDurationHours = (int) \App\Models\PendingRegistrationPolicySetting::getValue('holding_duration_hours', 72);
        } catch (\Exception $e) {
            // If settings table doesn't exist yet, use default value
            \Illuminate\Support\Facades\Log::warning('PendingRegistrationPolicySetting table not found, using default holding duration', [
                'error' => $e->getMessage()
            ]);
            $holdingDurationHours = 72; // Default 3 days
        }
        
        $this->expires_at = $this->submissionDate 
            ? \Carbon\Carbon::parse($this->submissionDate)->addHours($holdingDurationHours)
            : now()->addHours($holdingDurationHours);
        return $this->expires_at;
    }

    /**
     * Check if reminder should be sent
     */
    public function shouldSendReminder()
    {
        if ($this->reminder_sent || !$this->expires_at) {
            return false;
        }

        try {
            $reminderHours = (int) \App\Models\PendingRegistrationPolicySetting::getValue('reminder_hours_before_expiry', 24);
        } catch (\Exception $e) {
            // If settings table doesn't exist yet, use default value
            $reminderHours = 24; // Default 24 hours
        }
        
        $reminderTime = $this->expires_at->copy()->subHours($reminderHours);

        return now()->greaterThanOrEqualTo($reminderTime) && !$this->isExpired();
    }
}