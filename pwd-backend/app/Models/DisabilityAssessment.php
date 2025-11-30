<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class DisabilityAssessment extends Model
{
    use HasFactory;

    protected $table = 'disability_assessments';

    protected $fillable = [
        'application_id',
        'reference_number',
        'assessment_date',
        'assessment_time',
        'slot_number',
        'status',
        'applicant_name',
        'applicant_email',
        'applicant_contact',
        'disability_type',
        'disability_description',
        'disability_cause',
        'disability_onset_date',
        'disability_severity',
        'functional_limitations',
        'mobility_status',
        'communication_ability',
        'self_care_ability',
        'learning_ability',
        'attending_physician',
        'physician_license_no',
        'medical_facility',
        'medical_findings',
        'recommendations',
        'assistive_devices_needed',
        'assistive_devices_current',
        'assessed_by',
        'assessed_at',
        'finalized_by',
        'finalized_at',
        'pdf_path',
        'pdf_generated_at',
        'assessor_notes',
        'applicant_remarks',
        'scheduling_email_sent_at',
        'reminder_email_sent_at'
    ];

    protected $casts = [
        'assessment_date' => 'date',
        'disability_onset_date' => 'date',
        'functional_limitations' => 'array',
        'assistive_devices_needed' => 'array',
        'assistive_devices_current' => 'array',
        'assessed_at' => 'datetime',
        'finalized_at' => 'datetime',
        'pdf_generated_at' => 'datetime',
        'scheduling_email_sent_at' => 'datetime',
        'reminder_email_sent_at' => 'datetime'
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FINALIZED = 'finalized';
    const STATUS_UPLOADED = 'uploaded';

    // Severity constants
    const SEVERITY_MILD = 'mild';
    const SEVERITY_MODERATE = 'moderate';
    const SEVERITY_SEVERE = 'severe';
    const SEVERITY_PROFOUND = 'profound';

    /**
     * Get the application associated with this assessment
     */
    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id', 'applicationID');
    }

    /**
     * Get the staff who assessed
     */
    public function assessor()
    {
        return $this->belongsTo(User::class, 'assessed_by', 'userID');
    }

    /**
     * Get the staff who finalized
     */
    public function finalizer()
    {
        return $this->belongsTo(User::class, 'finalized_by', 'userID');
    }

    /**
     * Generate a unique reference number for assessment
     */
    public static function generateReferenceNumber()
    {
        $prefix = 'DA';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -4));
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Get available slots for a specific date (max 10 per day)
     */
    public static function getAvailableSlots($date)
    {
        $bookedSlots = self::whereDate('assessment_date', $date)
            ->whereIn('status', [self::STATUS_SCHEDULED, self::STATUS_COMPLETED, self::STATUS_FINALIZED])
            ->pluck('slot_number')
            ->toArray();
        
        $allSlots = range(1, 10);
        return array_diff($allSlots, $bookedSlots);
    }

    /**
     * Check if a date has available slots
     */
    public static function hasAvailableSlots($date)
    {
        $count = self::whereDate('assessment_date', $date)
            ->whereIn('status', [self::STATUS_SCHEDULED, self::STATUS_COMPLETED, self::STATUS_FINALIZED])
            ->count();
        
        return $count < 10;
    }

    /**
     * Get the next available slot for a date
     */
    public static function getNextAvailableSlot($date)
    {
        $availableSlots = self::getAvailableSlots($date);
        return !empty($availableSlots) ? min($availableSlots) : null;
    }

    /**
     * Get count of appointments for a date
     */
    public static function getAppointmentCount($date)
    {
        return self::whereDate('assessment_date', $date)
            ->whereIn('status', [self::STATUS_SCHEDULED, self::STATUS_COMPLETED, self::STATUS_FINALIZED])
            ->count();
    }

    /**
     * Scope for pending assessments
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for scheduled assessments
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    /**
     * Scope for today's assessments
     */
    public function scopeToday($query)
    {
        return $query->whereDate('assessment_date', today());
    }

    /**
     * Scope for upcoming assessments
     */
    public function scopeUpcoming($query)
    {
        return $query->where('assessment_date', '>=', today())
            ->where('status', self::STATUS_SCHEDULED)
            ->orderBy('assessment_date')
            ->orderBy('slot_number');
    }

    /**
     * Get status label for display
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pending Scheduling',
            self::STATUS_SCHEDULED => 'Scheduled',
            self::STATUS_COMPLETED => 'Assessment Completed',
            self::STATUS_FINALIZED => 'Finalized',
            self::STATUS_UPLOADED => 'PDF Uploaded',
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
            self::STATUS_SCHEDULED => 'info',
            self::STATUS_COMPLETED => 'primary',
            self::STATUS_FINALIZED => 'success',
            self::STATUS_UPLOADED => 'success',
            default => 'default'
        };
    }

    /**
     * Check if assessment can be edited
     */
    public function canBeEdited()
    {
        return in_array($this->status, [
            self::STATUS_SCHEDULED,
            self::STATUS_COMPLETED
        ]);
    }

    /**
     * Check if assessment can be finalized
     */
    public function canBeFinalized()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Get formatted assessment time slots
     */
    public static function getTimeSlots()
    {
        return [
            1 => '8:00 AM - 8:30 AM',
            2 => '8:30 AM - 9:00 AM',
            3 => '9:00 AM - 9:30 AM',
            4 => '9:30 AM - 10:00 AM',
            5 => '10:00 AM - 10:30 AM',
            6 => '10:30 AM - 11:00 AM',
            7 => '1:00 PM - 1:30 PM',
            8 => '1:30 PM - 2:00 PM',
            9 => '2:00 PM - 2:30 PM',
            10 => '2:30 PM - 3:00 PM'
        ];
    }

    /**
     * Get time slot label
     */
    public function getTimeSlotLabelAttribute()
    {
        $slots = self::getTimeSlots();
        return $slots[$this->slot_number] ?? 'Unknown';
    }
}

