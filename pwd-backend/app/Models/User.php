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
        'last_failed_login' => 'datetime',
        'account_locked_until' => 'datetime',
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
        if (!$this->account_locked_until) {
            return false;
        }
        try {
            return now()->isBefore($this->account_locked_until);
        } catch (\Exception $e) {
            \Log::warning('Error checking account lock status: ' . $e->getMessage());
            return false;
        }
    }

    public function requiresCaptcha()
    {
        return ($this->failed_login_attempts ?? 0) >= 3;
    }

    public function incrementFailedAttempts()
    {
        try {
            // Check if column exists before incrementing
            if (!isset($this->failed_login_attempts)) {
                $this->failed_login_attempts = 0;
            }
            
            $this->increment('failed_login_attempts');
            $this->update(['last_failed_login' => now()]);
            
            // Refresh to get updated value
            $this->refresh();
            
            // Lock account after 5 failed attempts
            if (($this->failed_login_attempts ?? 0) >= 5) {
                $this->update(['account_locked_until' => now()->addMinutes(5)]);
            }
        } catch (\Exception $e) {
            // If column doesn't exist, set default values
            \Log::warning('Failed to increment login attempts: ' . $e->getMessage());
            $this->update([
                'failed_login_attempts' => ($this->failed_login_attempts ?? 0) + 1,
                'last_failed_login' => now()
            ]);
        }
    }

    public function resetFailedAttempts()
    {
        try {
            $this->update([
                'failed_login_attempts' => 0,
                'last_failed_login' => null,
                'account_locked_until' => null
            ]);
        } catch (\Exception $e) {
            // If columns don't exist, just log and continue
            \Log::warning('Failed to reset login attempts: ' . $e->getMessage());
        }
    }
}
