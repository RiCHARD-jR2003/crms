<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'https://elizabeth-microphone-owners-roads.trycloudflare.com',
        'https://happens-acceptable-architect-bumper.trycloudflare.com',
        'https://wherever-newark-kenneth-sku.trycloudflare.com',
        'https://landscapes-buys-treasury-hat.trycloudflare.com',
        'https://strategies-labour-cage-membrane.trycloudflare.com',
        'https://vitamin-fine-hip-experiencing.trycloudflare.com',
        'https://prozac-invitations-lucy-visits.trycloudflare.com',
        'https://remind-ignored-putting-laid.trycloudflare.com',
        'https://deemed-treatment-founder-retention.trycloudflare.com',
        'https://otherwise-editor-judy-panel.trycloudflare.com',
        'https://avoid-fallen-nevertheless-issn.trycloudflare.com', // Previous frontend tunnel
        'https://speakers-calendar-avi-assumes.trycloudflare.com', // Previous frontend tunnel
        'https://hose-cherry-rapid-complement.trycloudflare.com', // Previous backend tunnel
        'https://attempts-substance-sustained-suspension.trycloudflare.com', // Previous frontend tunnel
        'https://trustees-fibre-revolutionary-lists.trycloudflare.com', // Previous backend tunnel
        'https://zum-quality-alcohol-regulations.trycloudflare.com', // Previous frontend tunnel
        'https://refurbished-consultancy-alcohol-navigator.trycloudflare.com', // Current backend tunnel
        'https://casey-impossible-odds-alexander.trycloudflare.com', // Current frontend tunnel
    ],

    'allowed_origins_patterns' => [
        '#^https://.*\.trycloudflare\.com$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
