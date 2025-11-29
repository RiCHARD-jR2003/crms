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
        'benefitID',
        'title',
        'content',
        'type',
        'category',
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

    public function benefit()
    {
        return $this->belongsTo(Benefit::class, 'benefitID', 'id');
    }
}