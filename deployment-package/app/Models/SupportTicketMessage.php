<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportTicketMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'support_ticket_id',
        'message',
        'sender_type',
        'sender_id',
        'attachment_path',
        'attachment_name',
        'attachment_type',
        'attachment_size'
    ];

    /**
     * Get the support ticket that owns the message.
     */
    public function supportTicket(): BelongsTo
    {
        return $this->belongsTo(SupportTicket::class);
    }

    /**
     * Get the sender (PWD member or Admin).
     */
    public function sender()
    {
        if ($this->sender_type === 'pwd_member') {
            return $this->belongsTo(PWDMember::class, 'sender_id');
        } elseif ($this->sender_type === 'admin') {
            return $this->belongsTo(Admin::class, 'sender_id');
        }
        return null;
    }

    /**
     * Get sender name for display.
     */
    public function getSenderNameAttribute(): string
    {
        if ($this->sender_type === 'pwd_member') {
            $pwdMember = PWDMember::find($this->sender_id);
            return $pwdMember ? $pwdMember->firstName . ' ' . $pwdMember->lastName : 'PWD Member';
        } elseif ($this->sender_type === 'admin') {
            $admin = Admin::find($this->sender_id);
            return $admin ? $admin->firstName . ' ' . $admin->lastName : 'Admin';
        }
        return 'Unknown';
    }

    /**
     * Check if message has an attachment.
     */
    public function hasAttachment(): bool
    {
        return !empty($this->attachment_path);
    }

    /**
     * Get attachment URL for download.
     */
    public function getAttachmentUrlAttribute(): ?string
    {
        if ($this->hasAttachment()) {
            return url('storage/' . $this->attachment_path);
        }
        return null;
    }
}
