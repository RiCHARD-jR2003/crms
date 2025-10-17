<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberDocument extends Model
{
    use HasFactory;

    protected $table = 'member_documents';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'member_id',
        'required_document_id',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
        'uploaded_at',
        'status',
        'notes',
        'reviewed_by',
        'reviewed_at'
    ];

    protected $casts = [
        'file_size' => 'integer',
        'uploaded_at' => 'datetime',
        'reviewed_at' => 'datetime'
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

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by', 'userID');
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
