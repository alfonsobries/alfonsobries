<?php

return [
    /*
     * The catalog entry used when no runtime selection has been made yet
     * (see App\Images\ModelCatalog and the `illustrator_model` setting).
     */
    'default_model' => env('ILLUSTRATOR_MODEL', 'flare-low'),

    'providers' => [
        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'base_url' => env('OPENAI_URL', 'https://api.openai.com/v1'),
            'model' => env('OPENAI_IMAGE_MODEL', 'gpt-image-2.6-flare'),
            'quality' => env('OPENAI_IMAGE_QUALITY', 'low'),
        ],
        'xai' => [
            'api_key' => env('XAI_API_KEY'),
            'base_url' => env('XAI_BASE_URL', 'https://api.x.ai'),
            'model' => env('XAI_IMAGE_MODEL', 'grok-imagine-image-2.0'),
            'resolution' => env('XAI_IMAGE_RESOLUTION', '1k'),
        ],
    ],

    /*
     * The image models selectable from the app settings (Alfonso only).
     * `price` is the approximate USD cost per square image and only drives
     * the cheapest-to-priciest ordering; `cost` and `blurb` are the
     * human-readable comparison shown in the picker.
     */
    'models' => [
        'flare-low' => [
            'provider' => 'openai',
            'model' => 'gpt-image-2.6-flare',
            'label' => 'Images 2.6 Flare · low',
            'options' => ['quality' => 'low'],
            'price' => 0.011,
            'cost' => '$',
            'blurb' => 'Cheapest and fastest - plenty for kid-friendly illustrations.',
            'recommended' => true,
        ],
        'grok-imagine-2' => [
            'provider' => 'xai',
            'model' => 'grok-imagine-image-2.0',
            'label' => 'Grok Imagine 2.0',
            'options' => ['resolution' => '1k', 'quality' => 'low'],
            'price' => 0.04,
            'cost' => '$$',
            'blurb' => 'xAI\'s image model - a different look, worth comparing.',
            'recommended' => false,
        ],
        'flare-medium' => [
            'provider' => 'openai',
            'model' => 'gpt-image-2.6-flare',
            'label' => 'Images 2.6 Flare · medium',
            'options' => ['quality' => 'medium'],
            'price' => 0.042,
            'cost' => '$$',
            'blurb' => 'Sharper lines, a bit slower and ~4x the price.',
            'recommended' => false,
        ],
        'sunburst-high' => [
            'provider' => 'openai',
            'model' => 'gpt-image-2.6-sunburst',
            'label' => 'Images 2.6 Sunburst · high',
            'options' => ['quality' => 'high'],
            'price' => 0.167,
            'cost' => '$$$',
            'blurb' => 'Most detailed and precise on edits, but slow and ~15x the cheapest.',
            'recommended' => false,
        ],
    ],
];
