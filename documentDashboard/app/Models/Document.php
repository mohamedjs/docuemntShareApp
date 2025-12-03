<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'user_id',
        'share_token',
        'is_share_enabled',
        'share_permission',
        'share_expires_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'share_expires_at' => 'datetime',
        'is_share_enabled' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function collaborators()
    {
        return $this->belongsToMany(User::class, 'document_collaborators');
    }

    public function versions()
    {
        return $this->hasMany(DocumentVersion::class);
    }

    /**
     * Generate a unique share token
     */
    public function generateShareToken(): string
    {
        do {
            $token = bin2hex(random_bytes(32));
        } while (self::where('share_token', $token)->exists());

        return $token;
    }

    /**
     * Check if share link is valid
     */
    public function isShareValid(): bool
    {
        if (!$this->is_share_enabled) {
            return false;
        }

        if ($this->share_expires_at && $this->share_expires_at->isPast()) {
            return false;
        }

        return true;
    }
}
