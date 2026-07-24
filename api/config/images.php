<?php

return [
    /*
     * The catalog entry used when no runtime selection has been made yet
     * (see App\Images\ModelCatalog and the `illustrator_model` setting).
     */
    'default_model' => env('ILLUSTRATOR_MODEL', 'gpt-image-2-low'),

    'providers' => [
        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'base_url' => env('OPENAI_URL', 'https://api.openai.com/v1'),
            'model' => env('OPENAI_IMAGE_MODEL', 'gpt-image-2'),
            'quality' => env('OPENAI_IMAGE_QUALITY', 'low'),
        ],
        'xai' => [
            'api_key' => env('XAI_API_KEY'),
            'base_url' => env('XAI_BASE_URL', 'https://api.x.ai'),
            'model' => env('XAI_IMAGE_MODEL', 'grok-imagine-image-quality'),
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
        'gpt-image-2-low' => [
            'provider' => 'openai',
            'model' => 'gpt-image-2',
            'label' => 'GPT Image 2 · low',
            'options' => ['quality' => 'low'],
            'price' => 0.011,
            'cost' => '$',
            'blurb' => 'Cheapest and fastest — plenty for kid-friendly illustrations.',
            'recommended' => true,
        ],
        'gpt-image-2-medium' => [
            'provider' => 'openai',
            'model' => 'gpt-image-2',
            'label' => 'GPT Image 2 · medium',
            'options' => ['quality' => 'medium'],
            'price' => 0.042,
            'cost' => '$$',
            'blurb' => 'Sharper lines, a bit slower and ~4× the price.',
            'recommended' => false,
        ],
        'grok-imagine' => [
            'provider' => 'xai',
            'model' => 'grok-imagine-image-quality',
            'label' => 'Grok Imagine',
            'options' => ['resolution' => '1k'],
            'price' => 0.07,
            'cost' => '$$',
            'blurb' => 'xAI\'s image model — different look, worth comparing.',
            'recommended' => false,
        ],
        'gpt-image-2-high' => [
            'provider' => 'openai',
            'model' => 'gpt-image-2',
            'label' => 'GPT Image 2 · high',
            'options' => ['quality' => 'high'],
            'price' => 0.167,
            'cost' => '$$$',
            'blurb' => 'Most detailed but slow and ~15× the cheapest — overkill here.',
            'recommended' => false,
        ],
    ],
];
