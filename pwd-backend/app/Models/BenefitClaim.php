<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BenefitClaim extends Model
{
    use HasFactory;

    protected $table = 'benefit_claim';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'pwdID',
        'benefitID',
        'claimDate',
        'status',
        'claimantType',
        'claimantName',
        'claimantRelation',
        'authorizationLetter',
        'signedTreasuryLetter'
    ];

    protected $casts = [
        'claimDate' => 'datetime',
        'status' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function pwdMember()
    {
        return $this->belongsTo(PWDMember::class, 'pwdID', 'userID');
    }

    public function benefit()
    {
        return $this->belongsTo(Benefit::class, 'benefitID', 'id');
    }

    // Query Scopes for Performance
    public function scopeForUser($query, $userId)
    {
        return $query->where('pwdID', $userId);
    }

    public function scopeClaimed($query)
    {
        return $query->where('status', 'Claimed');
    }

    public function scopeForBenefit($query, $benefitId)
    {
        return $query->where('benefitID', $benefitId);
    }

    public function scopeRecentFirst($query)
    {
        return $query->orderBy('created_at', 'desc')->orderBy('id', 'desc');
    }

    public function scopeSelectEssential($query)
    {
        return $query->select([
            'id', 'pwdID', 'benefitID', 'claimDate', 'status',
            'claimantType', 'claimantName', 'claimantRelation',
            'authorizationLetter', 'signedTreasuryLetter', 'created_at', 'updated_at'
        ]);
    }
}