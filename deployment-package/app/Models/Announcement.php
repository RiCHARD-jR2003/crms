<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $table = 'announcement';
    protected $primaryKey = 'announcementID';
    
    protected $fillable = [
        'authorID',
        'title',
        'content',
        'type',
        'priority',
        'targetAudience',
        'status',
        'publishDate',
        'expiryDate',
        'views'
    ];

    protected $casts = [
        'publishDate' => 'date',
        'expiryDate' => 'date'
    ];

    // Relationships
    public function author()
    {
        return $this->belongsTo(User::class, 'authorID', 'userID');
    }
}