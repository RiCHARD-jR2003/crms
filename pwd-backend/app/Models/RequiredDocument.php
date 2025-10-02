<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequiredDocument extends Model
{
    use HasFactory;

    protected $table = 'required_documents';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'name',
        'description',
        'is_required',
        'file_types',
        'max_file_size',
        'created_by',
        'status',
        'effective_date',
        'expiry_date'
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'file_types' => 'array',
        'max_file_size' => 'integer',
        'effective_date' => 'date',
        'expiry_date' => 'date'
    ];

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'userID');
    }

    public function memberDocuments()
    {
        return $this->hasMany(MemberDocument::class, 'required_document_id', 'id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }
}
