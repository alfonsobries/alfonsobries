<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Support availability
    |--------------------------------------------------------------------------
    |
    | Alfonso answers the live support chat of several businesses. One
    | availability schedule lives here and is pushed to every brand below
    | whenever it changes; each brand also pulls it to reconcile. A brand is
    | enabled once both its URL (the brand's API base, including `/api`) and
    | its shared secret are set. `php artisan availability:sync-brands`
    | copies these values into the `support_brands` table.
    |
    */

    'timezone' => env('SUPPORT_TIMEZONE', 'America/Mexico_City'),

    'brands' => [
        'zebrasnap' => [
            'label' => 'ZebraSnap',
            'url' => env('SUPPORT_SYNC_ZEBRASNAP_URL'),
            'secret' => env('SUPPORT_SYNC_ZEBRASNAP_SECRET'),
        ],
        'kondable' => [
            'label' => 'Kondable',
            'url' => env('SUPPORT_SYNC_KONDABLE_URL'),
            'secret' => env('SUPPORT_SYNC_KONDABLE_SECRET'),
        ],
        'vexilo' => [
            'label' => 'Vexilo',
            'url' => env('SUPPORT_SYNC_VEXILO_URL'),
            'secret' => env('SUPPORT_SYNC_VEXILO_SECRET'),
        ],
    ],

];
