<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PWDMember extends Model
{
    use HasFactory;

    protected $table = 'pwd_members';
    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'userID',
        'firstName',
        'lastName',
        'middleName',
        'birthDate',
        'gender',
        'disabilityType',
        'address',
        'contactNumber',
        'email',
        'barangay',
        'emergencyContact',
        'emergencyPhone',
        'emergencyRelationship',
        'status'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'userID');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'pwdID', 'userID');
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'pwdID', 'userID');
    }

    public function benefitClaims()
    {
        return $this->hasMany(BenefitClaim::class, 'pwdID', 'userID');
    }

    protected $casts = [
        'birthDate' => 'date'
    ];
}