<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class DocumentCorrectionRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id_string',
        'documents_to_correct',
        'notes',
        'requested_by',
        'requested_by_name',
        'status',
        'correction_token',
        'expires_at',
        'completed_at'
    ];

    protected $casts = [
        'documents_to_correct' => 'array',
        'expires_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    // Relationship with Application
    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id_string', 'applicationID');
    }

    // Check if the correction request is expired
    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    // Check if the correction request is still valid
    public function isValid()
    {
        return $this->status === 'pending' && !$this->isExpired();
    }

    // Mark as completed
    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);
    }

    // Scope for active correction requests
    public function scopeActive($query)
    {
        return $query->where('status', 'pending')
                    ->where('expires_at', '>', now());
    }

    // Scope for expired correction requests
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }
}
