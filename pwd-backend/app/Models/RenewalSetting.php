<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RenewalSetting extends Model
{
    use HasFactory;

    protected $table = 'renewal_settings';
    
    protected $fillable = [
        'key',
        'value',
        'description'
    ];

    /**
     * Get a setting value by key
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function getValue($key, $default = null)
    {
        try {
            $setting = self::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('RenewalSetting table not found, using default value', [
                'key' => $key,
                'error' => $e->getMessage()
            ]);
            return $default;
        }
    }

    /**
     * Set a setting value by key
     *
     * @param string $key
     * @param mixed $value
     * @return bool
     */
    public static function setValue($key, $value)
    {
        try {
            return self::updateOrCreate(
                ['key' => $key],
                ['value' => (string) $value]
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to set renewal setting', [
                'key' => $key,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get all settings
     *
     * @return array
     */
    public static function getAllSettings()
    {
        try {
            return self::pluck('value', 'key')->toArray();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('RenewalSetting table not found', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
}

