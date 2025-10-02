<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentNotification extends Model
{
    use HasFactory;

    protected $table = 'document_notifications';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'member_id',
        'required_document_id',
        'title',
        'message',
        'is_read',
        'sent_at',
        'read_at'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'sent_at' => 'datetime',
        'read_at' => 'datetime'
    ];

    // Relationships
    public function member()
    {
        return $this->belongsTo(PWDMember::class, 'member_id', 'userID');
    }

    public function requiredDocument()
    {
        return $this->belongsTo(RequiredDocument::class, 'required_document_id', 'id');
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }
}
