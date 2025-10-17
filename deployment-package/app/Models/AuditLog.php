<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $table = 'audit_log';
    protected $primaryKey = 'logID';
    
    protected $fillable = [
        'userID',
        'action',
        'timestamp'
    ];

    protected $casts = [
        'timestamp' => 'datetime'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'userID');
    }
}