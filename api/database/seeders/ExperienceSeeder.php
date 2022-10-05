<?php

namespace Database\Seeders;

use App\Models\Experience;
use Illuminate\Database\Seeder;

class ExperienceSeeder extends Seeder
{
    protected $initialData = [
        [
            'period' => 'Oct 2021 - Present day (~2 year)',
            'place' => 'Remote',
            'title' => 'Ark Ecosystem - Fullstack Developer',
            'description' => 'I work remotely as a Full Stack Software Developer for [Ark](https://ark.io/) a blockchain solutions company working on his different open source and proprietary software products with technologies like React, Laravel and Alpine.js.',
            'type' => 'work',
        ],
        [
            'period' => 'May 2018 - Oct 2021 (~2 years)',
            'place' => 'Remote',
            'title' => 'Surg.io - Fullstack Developer',
            'description' => 'I worked remotely as a Full Stack Software Developer for [Surgio](https://www.surgio.com/) a SaaS designed for manage hospitals where over time I help to increase the user experience by completely renovating the frontend with all kinds of custom Vue components, improving the overall frontend workflow, implementing, even more, features in the backend and work with the team to standardize and improve the full application codebase.',
            'type' => 'work',
        ],
        [
            'period' => 'Feb 2009 - Dic 2019 (~10 years)',
            'place' => 'Mexico City',
            'title' => 'Vexilo - Founder & Developer',
            'description' => 'I created the brand [Vexilo](https://www.vexilo.com/) in which I developed more than 50 successful websites and web applications for all kinds of companies of all sizes in Mexico',
            'type' => 'work',
        ],
        [
            'period' => 'Aug 2007 - Jan 2009 (~2 years)',
            'place' => 'Mexico City',
            'title' => 'Ingenia Agency - Fullstack Developer',
            'description' => 'I worked for Ingenia Agency, one of the top digital agencies in Mexico City, where I developed many successful websites, e-commerce, and web applications for some of the important companies in Mexico City, like Brother Mexico, Coca-Cola, Megacable, etc.',
            'type' => 'work',
        ],
    ];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        foreach ($this->initialData as $data) {
            Experience::create($data);
        }
    }
}
