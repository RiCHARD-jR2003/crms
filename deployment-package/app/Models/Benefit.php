<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Benefit extends Model
{
    use HasFactory;

    protected $table = 'benefit';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'benefitType',
        'description',
        'schedule',
        'title',
        'type',
        'amount',
        'targetRecipients',
        'distributionDate',
        'expiryDate',
        'barangay',
        'selectedBarangays',
        'quarter',
        'birthdayMonth',
        'status',
        'distributed',
        'pending',
        'color',
        'submittedDate',
        'approvalFile',
        'approvedDate'
    ];

    protected $casts = [
        'schedule' => 'date',
        'distributionDate' => 'date',
        'expiryDate' => 'date',
        'submittedDate' => 'datetime',
        'approvedDate' => 'datetime',
        'distributed' => 'integer',
        'pending' => 'integer',
        'selectedBarangays' => 'array'
    ];

    // Relationships
    public function benefitClaims()
    {
        return $this->hasMany(BenefitClaim::class, 'benefitID', 'id');
    }
}