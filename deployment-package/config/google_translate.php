<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Google Translate API Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your Google Translate API settings.
    | You can get your API key from the Google Cloud Console.
    |
    */

    'api_key' => env('GOOGLE_TRANSLATE_API_KEY'),
    'project_id' => env('GOOGLE_CLOUD_PROJECT_ID', 'your-project-id'), // Your Google Cloud Project ID
    
    /*
    |--------------------------------------------------------------------------
    | Supported Languages
    |--------------------------------------------------------------------------
    |
    | List of supported languages for translation.
    | These are mapped to Google Translate language codes.
    |
    */
    
    'supported_languages' => [
        'en' => [
            'name' => 'English',
            'google_code' => 'en',
        ],
        'tl' => [
            'name' => 'Filipino (Tagalog)',
            'google_code' => 'tl',
        ],
        'ceb' => [
            'name' => 'Cebuano',
            'google_code' => 'ceb',
        ],
        'hil' => [
            'name' => 'Hiligaynon (Ilonggo)',
            'google_code' => 'hil',
        ],
        'ilo' => [
            'name' => 'Ilocano',
            'google_code' => 'ilo',
        ],
        'war' => [
            'name' => 'Waray',
            'google_code' => 'war',
        ],
        'pam' => [
            'name' => 'Kapampangan',
            'google_code' => 'pam',
        ],
        'bik' => [
            'name' => 'Bikol',
            'google_code' => 'bik',
        ],
        'pag' => [
            'name' => 'Pangasinan',
            'google_code' => 'pag',
        ],
        'mrw' => [
            'name' => 'Maranao',
            'google_code' => 'mrw',
        ],
        'tsg' => [
            'name' => 'Tausug',
            'google_code' => 'tsg',
        ],
        'mbb' => [
            'name' => 'Manobo',
            'google_code' => 'mbb',
        ],
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for caching translations to improve performance.
    |
    */
    
    'cache' => [
        'enabled' => env('GOOGLE_TRANSLATE_CACHE_ENABLED', true),
        'ttl' => env('GOOGLE_TRANSLATE_CACHE_TTL', 86400), // 24 hours in seconds
        'prefix' => 'google_translate_',
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Fallback Settings
    |--------------------------------------------------------------------------
    |
    | What to do when Google Translate API is unavailable.
    |
    */
    
    'fallback' => [
        'enabled' => env('GOOGLE_TRANSLATE_FALLBACK_ENABLED', true),
        'default_language' => 'en',
    ],
];
