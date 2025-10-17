<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $table = 'report';
    protected $primaryKey = 'reportID';
    
    protected $fillable = [
        'generatedBy',
        'reportType',
        'generationDate'
    ];

    protected $casts = [
        'generationDate' => 'date'
    ];

    // Relationships
    public function admin()
    {
        return $this->belongsTo(Admin::class, 'generatedBy', 'userID');
    }
}