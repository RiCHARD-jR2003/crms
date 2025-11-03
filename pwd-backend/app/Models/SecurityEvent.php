<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecurityEvent extends Model
{
    use HasFactory;

    protected $table = 'security_events';
    protected $primaryKey = 'eventID';
    
    protected $fillable = [
        'event_type',
        'severity',
        'ip_address',
        'user_agent',
        'userID',
        'url',
        'method',
        'request_data',
        'description',
        'detected_pattern',
        'status',
        'detected_at'
    ];

    protected $casts = [
        'detected_at' => 'datetime',
        'request_data' => 'array'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'userID');
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('event_type', $type);
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('detected_at', '>=', now()->subDays($days));
    }
}
