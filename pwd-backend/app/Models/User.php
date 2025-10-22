<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'userID';
    public $incrementing = true;

    protected $fillable = [
        'userID',
        'username',
        'firstName',
        'lastName',
        'password',
        'email',
        'role',
        'status',
        'password_change_required',
        'failed_login_attempts',
        'last_failed_login',
        'account_locked_until'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password_change_required' => 'boolean',
    ];

    // Relationships
    public function admin()
    {
        return $this->hasOne(Admin::class, 'userID', 'userID');
    }

    public function barangayPresident()
    {
        return $this->hasOne(BarangayPresident::class, 'userID', 'userID');
    }

    public function pwdMember()
    {
        return $this->hasOne(PWDMember::class, 'userID', 'userID');
    }

    public function superAdmin()
    {
        return $this->hasOne(SuperAdmin::class, 'userID', 'userID');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'userID', 'userID');
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class, 'authorID', 'userID');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'generatedBy', 'userID');
    }

    // Helper methods
    public function isAdmin()
    {
        return $this->role === 'Admin';
    }

    public function isBarangayPresident()
    {
        return $this->role === 'BarangayPresident';
    }

    public function isPWDMember()
    {
        return $this->role === 'PWDMember';
    }

    public function isSuperAdmin()
    {
        return $this->role === 'SuperAdmin';
    }

    // Override default password field
    public function getAuthPassword()
    {
        return $this->password;
    }

    // Helper method to check if password change is required
    public function requiresPasswordChange()
    {
        // Only PWDMember users are required to change their password
        return $this->password_change_required && $this->role === 'PWDMember';
    }

    // Helper method to mark password as changed
    public function markPasswordChanged()
    {
        $this->update(['password_change_required' => false]);
    }

    // Login security helper methods
    public function isAccountLocked()
    {
        return $this->account_locked_until && now()->isBefore($this->account_locked_until);
    }

    public function requiresCaptcha()
    {
        return $this->failed_login_attempts >= 3;
    }

    public function incrementFailedAttempts()
    {
        $this->increment('failed_login_attempts');
        $this->update(['last_failed_login' => now()]);
        
        // Lock account after 5 failed attempts
        if ($this->failed_login_attempts >= 5) {
            $this->update(['account_locked_until' => now()->addMinutes(5)]);
        }
    }

    public function resetFailedAttempts()
    {
        $this->update([
            'failed_login_attempts' => 0,
            'last_failed_login' => null,
            'account_locked_until' => null
        ]);
    }
}
