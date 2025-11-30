<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IDClaim extends Model
{
    use HasFactory;

    protected $table = 'id_claims';

    protected $fillable = [
        'member_id',
        'claim_type',
        'status',
        'claimant_type',
        'claimant_name',
        'claimant_relationship',
        'claimant_contact',
        'claimant_id_type',
        'claimant_id_number',
        'authorization_letter_path',
        'scheduled_pickup_date',
        'scheduled_pickup_time',
        'scheduling_notes',
        'processed_by',
        'processed_at',
        'released_by',
        'released_at',
        'claimed_at',
        'receipt_number',
        'notes',
        'claimant_signature'
    ];

    protected $casts = [
        'scheduled_pickup_date' => 'date',
        'scheduled_pickup_time' => 'datetime:H:i',
        'processed_at' => 'datetime',
        'released_at' => 'datetime',
        'claimed_at' => 'datetime'
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_READY_FOR_PICKUP = 'ready_for_pickup';
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_CLAIMED = 'claimed';
    const STATUS_CANCELLED = 'cancelled';

    // Claim type constants
    const TYPE_NEW = 'new';
    const TYPE_RENEWAL = 'renewal';

    // Claimant type constants
    const CLAIMANT_MEMBER = 'Member';
    const CLAIMANT_GUARDIAN = 'Guardian';
    const CLAIMANT_REPRESENTATIVE = 'Representative';

    /**
     * Get the PWD member associated with this claim
     */
    public function member()
    {
        return $this->belongsTo(PWDMember::class, 'member_id', 'userID');
    }

    /**
     * Get the staff who processed this claim
     */
    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by', 'userID');
    }

    /**
     * Get the staff who released the card
     */
    public function releaser()
    {
        return $this->belongsTo(User::class, 'released_by', 'userID');
    }

    /**
     * Generate a unique receipt number
     */
    public static function generateReceiptNumber()
    {
        $prefix = 'RC';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -4));
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Check if claim requires authorization letter
     */
    public function requiresAuthorizationLetter()
    {
        return $this->claimant_type === self::CLAIMANT_REPRESENTATIVE;
    }

    /**
     * Check if claim can be cancelled
     */
    public function canBeCancelled()
    {
        return in_array($this->status, [
            self::STATUS_PENDING,
            self::STATUS_PROCESSING,
            self::STATUS_READY_FOR_PICKUP,
            self::STATUS_SCHEDULED
        ]);
    }

    /**
     * Scope for pending claims
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for claims ready for pickup
     */
    public function scopeReadyForPickup($query)
    {
        return $query->where('status', self::STATUS_READY_FOR_PICKUP);
    }

    /**
     * Scope for scheduled claims
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    /**
     * Scope for today's scheduled pickups
     */
    public function scopeScheduledToday($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED)
                    ->whereDate('scheduled_pickup_date', today());
    }

    /**
     * Get status label for display
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_PROCESSING => 'Processing',
            self::STATUS_READY_FOR_PICKUP => 'Ready for Pickup',
            self::STATUS_SCHEDULED => 'Pickup Scheduled',
            self::STATUS_CLAIMED => 'Claimed',
            self::STATUS_CANCELLED => 'Cancelled',
            default => ucfirst($this->status)
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'warning',
            self::STATUS_PROCESSING => 'info',
            self::STATUS_READY_FOR_PICKUP => 'success',
            self::STATUS_SCHEDULED => 'primary',
            self::STATUS_CLAIMED => 'success',
            self::STATUS_CANCELLED => 'error',
            default => 'default'
        };
    }
}

