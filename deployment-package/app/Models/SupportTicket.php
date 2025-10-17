<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'subject',
        'description',
        'pwd_member_id',
        'status',
        'priority',
        'category',
        'resolved_at',
        'closed_at'
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    /**
     * Get the PWD member that owns the ticket.
     */
    public function pwdMember(): BelongsTo
    {
        return $this->belongsTo(PWDMember::class);
    }

    /**
     * Get the messages for the ticket.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(SupportTicketMessage::class)->orderBy('created_at');
    }

    /**
     * Generate a unique ticket number.
     */
    public static function generateTicketNumber(): string
    {
        $lastTicket = self::orderBy('id', 'desc')->first();
        $number = $lastTicket ? $lastTicket->id + 1 : 1;
        return 'SUP-' . str_pad($number, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Check if ticket is resolved.
     */
    public function isResolved(): bool
    {
        return in_array($this->status, ['resolved', 'closed']);
    }

    /**
     * Check if ticket is closed.
     */
    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }
}
