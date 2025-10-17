<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $table = 'complaint';
    protected $primaryKey = 'complaintID';
    
    protected $fillable = [
        'pwdID',
        'subject',
        'description',
        'status'
    ];

    protected $casts = [
        'status' => 'string'
    ];

    // Relationships
    public function pwdMember()
    {
        return $this->belongsTo(PWDMember::class, 'pwdID', 'userID');
    }
}