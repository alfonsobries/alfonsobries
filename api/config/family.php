<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Family timezone
    |--------------------------------------------------------------------------
    |
    | Where the family actually lives. The app stores timestamps in UTC, but a
    | rule like "once a day each" has to break at the family's midnight, not
    | at the server's.
    |
    */

    'timezone' => env('FAMILY_TIMEZONE', 'America/Mexico_City'),

];
