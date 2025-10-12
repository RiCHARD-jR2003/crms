<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BarangayPresident extends Model
{
    use HasFactory;

    protected $table = 'barangay_president';
    protected $primaryKey = 'userID';
    public $incrementing = false;

    protected $fillable = [
        'userID',
        'barangayID',
        'barangay',
        'preferred_language',
        'contact_number',
        'email'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'userID');
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class, 'authorID', 'userID');
    }
}