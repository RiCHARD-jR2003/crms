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
        'approvedDate',
        'announced_at'
    ];

    protected $casts = [
        'schedule' => 'date',
        'distributionDate' => 'datetime',
        'expiryDate' => 'datetime',
        'submittedDate' => 'datetime',
        'approvedDate' => 'datetime',
        'announced_at' => 'datetime',
        'distributed' => 'integer',
        'pending' => 'integer',
        'selectedBarangays' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function benefitClaims()
    {
        return $this->hasMany(BenefitClaim::class, 'benefitID', 'id');
    }

    // Query Scopes for Performance
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeForBarangay($query, $barangay)
    {
        return $query->where(function($q) use ($barangay) {
            $q->where('barangay', $barangay)
              ->orWhere('barangay', 'All')
              ->orWhereJsonContains('selectedBarangays', $barangay)
              ->orWhere(function($subQ) {
                  $subQ->whereNull('selectedBarangays')
                       ->orWhere('selectedBarangays', '[]')
                       ->orWhere('selectedBarangays', 'null');
              });
        });
    }

    public function scopeRecentFirst($query)
    {
        return $query->orderByRaw('COALESCE(created_at, distributionDate, updated_at) DESC');
    }

    public function scopeSelectEssential($query)
    {
        return $query->select([
            'id', 'title', 'type', 'amount', 'description', 'status',
            'barangay', 'selectedBarangays', 'distributionDate', 'expiryDate',
            'distributed', 'pending', 'color', 'created_at', 'updated_at'
        ]);
    }
}