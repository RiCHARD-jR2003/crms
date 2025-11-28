<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PWDMember extends Model
{
    use HasFactory;

    protected $table = 'pwd_members';
    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'userID',
        'pwd_id',
        'pwd_id_generated_at',
        'firstName',
        'lastName',
        'middleName',
        'suffix',
        'birthDate',
        'gender',
        'disabilityType',
        'address',
        'contactNumber',
        'email',
        'barangay',
        'emergencyContact',
        'emergencyPhone',
        'emergencyRelationship',
        'status',
        'cardClaimed',
        'cardIssueDate',
        'cardExpirationDate',
        'renewal_flag',
        'flagged_at',
        'renewal_reminder_sent_at'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'userID');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'pwdID', 'userID');
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'pwdID', 'userID');
    }

    public function benefitClaims()
    {
        return $this->hasMany(BenefitClaim::class, 'pwdID', 'userID');
    }

    public function memberDocuments()
    {
        return $this->hasMany(MemberDocument::class, 'member_id', 'userID');
    }

    public function idRenewals()
    {
        return $this->hasMany(IDRenewal::class, 'member_id', 'userID');
    }

    protected $casts = [
        'birthDate' => 'date',
        'cardIssueDate' => 'date',
        'cardExpirationDate' => 'date',
        'cardClaimed' => 'boolean',
        'renewal_flag' => 'boolean',
        'flagged_at' => 'datetime',
        'renewal_reminder_sent_at' => 'datetime'
    ];

    /**
     * Check if member is flagged for renewal
     *
     * @return bool
     */
    public function isFlaggedForRenewal()
    {
        return $this->renewal_flag === true;
    }

    /**
     * Check if member needs renewal (based on expiration date)
     *
     * @param int $daysBeforeExpiry
     * @return bool
     */
    public function needsRenewal($daysBeforeExpiry = null)
    {
        if (!$this->cardClaimed || !$this->cardExpirationDate) {
            return false;
        }

        if ($daysBeforeExpiry === null) {
            try {
                $daysBeforeExpiry = (int) RenewalSetting::getValue('renewal_days_before_expiry', 30);
            } catch (\Exception $e) {
                $daysBeforeExpiry = 30; // Default
            }
        }

        $expirationDate = \Carbon\Carbon::parse($this->cardExpirationDate);
        $thresholdDate = \Carbon\Carbon::today()->addDays($daysBeforeExpiry);

        return $expirationDate->lte($thresholdDate) && $expirationDate->gte(\Carbon\Carbon::today());
    }

    /**
     * Flag member for renewal
     *
     * @return bool
     */
    public function flagForRenewal()
    {
        return $this->update([
            'renewal_flag' => true,
            'flagged_at' => now()
        ]);
    }

    /**
     * Unflag member from renewal
     *
     * @return bool
     */
    public function unflagFromRenewal()
    {
        return $this->update([
            'renewal_flag' => false,
            'flagged_at' => null
        ]);
    }

    /**
     * Mark renewal reminder as sent
     *
     * @return bool
     */
    public function markRenewalReminderSent()
    {
        return $this->update([
            'renewal_reminder_sent_at' => now()
        ]);
    }

    /**
     * Check if renewal reminder should be sent
     *
     * @param int $reminderIntervalDays
     * @return bool
     */
    public function shouldSendRenewalReminder($reminderIntervalDays = null)
    {
        if (!$this->isFlaggedForRenewal()) {
            return false;
        }

        if ($reminderIntervalDays === null) {
            try {
                $reminderIntervalDays = (int) RenewalSetting::getValue('renewal_reminder_interval_days', 7);
            } catch (\Exception $e) {
                $reminderIntervalDays = 7; // Default
            }
        }

        // If never sent, send it
        if (!$this->renewal_reminder_sent_at) {
            return true;
        }

        // Check if interval has passed
        $lastSent = \Carbon\Carbon::parse($this->renewal_reminder_sent_at);
        return $lastSent->addDays($reminderIntervalDays)->lte(now());
    }

    /**
     * Scope for members flagged for renewal
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFlaggedForRenewal($query)
    {
        return $query->where('renewal_flag', true);
    }

    /**
     * Scope for members ready to claim (ID generated but not claimed)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeReadyToClaim($query)
    {
        return $query->where('cardClaimed', false)
                    ->whereNotNull('pwd_id')
                    ->whereNotNull('pwd_id_generated_at');
    }
}