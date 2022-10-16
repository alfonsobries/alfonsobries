<?php

namespace Database\Seeders;

use App\Models\ResumeExperience;
use Illuminate\Database\Seeder;

class ResumeExperienceSeeder extends Seeder
{
    protected $initialData = [
        [
            'period' => 'Oct 2021 - Present day (~2 years)',
            'place' => 'Remote',
            'title' => 'Ark Ecosystem - Fullstack Developer',
            'description' => 'I work remotely as a Full-Stack Software Developer for [Ark Ecosystem](https://ark.io/), where I have been one of the top contributors to his different blockchain-related products and technologies. Those projects include [ArkVault](https://app.arkvault.io), [MSQ](https://msq.io), [ArkScan](https://live.arkscan.io/) and [ArkLauncher](https://arklauncher.io/) within other tools and libraries.',
            'type' => 'work',
        ],
        [
            'period' => 'May 2018 - Oct 2021 (~2 years)',
            'place' => 'Remote',
            'title' => 'Surg.io - Fullstack Developer',
            'description' => 'I worked remotely as a Full Stack Software Developer for [Surgio](https://www.surgio.com/) where, as the top contributor on the project during my time there, I helped to increase the user experience by completely renovating the front with all kinds of custom Vue components, improving the overall workflow, implemented a lot of new features in the backend and worked with the team to standardize and enhance the application codebase.',
            'type' => 'work',
        ],
        [
            'period' => 'Feb 2009 - Dic 2019 (~10 years)',
            'place' => 'Mexico City',
            'title' => 'Vexilo - Founder & Developer',
            'description' => 'I established the company [Vexilo](https://www.vexilo.com/), where, for more than ten years, I developed and managed over 50 successful websites and web applications for a wide variety of companies in Mexico. In addition, as the company owner, I had the opportunity to acquire a lot of experience leading teams, creating positive relationships with clients, and general business management.',
            'type' => 'work',
        ],
        [
            'period' => 'Aug 2007 - Jan 2009 (~2 years)',
            'place' => 'Mexico City',
            'title' => 'Ingenia Agency - Fullstack Developer',
            'description' => 'While still in college, I was the youngest employee of [Ingenia Agency](https://ingenia.com), one of the top digital agencies in Mexico City. While working there, I had the opportunity to work and, in some cases, lead some projects for some of the important companies in Mexico City, like Brother Mexico, Coca-Cola, Megacable, and many more.',
            'type' => 'work',
        ],

        [
            'period' => 'Feb 2014 - Ene 2018 (4.5 years)',
            'place' => 'Online',
            'title' => 'La Salle University - Bachelor of Systems Engineering',
            'description' => 'I have a software engineering degree from La Salle University, one of the most recognized private universities in Mexico. In my undergraduate studies, I acquired one of the highest grades of my generation, placing me in the top 10%.',
            'type' => 'education',
        ],

        [
            'period' => 'Continual',
            'place' => 'Online',
            'title' => 'Online Courses & Self Learning',
            'description' => <<<'HTML'
I'm used to learning through online courses as an important source of new knowledge. Some of the recent or favorite ones are:

* PHP, Vue, Laravel, & TDD Courses at [Laracasts](https://laracasts.com/)
* Refactoring UI
* Test-Driven Laravel & Refactoring to Collections
* Complete Guide to Elasticsearch
* Docker and Kubernetes: The Complete Guide
* React - The Complete Guide & Understanding TypeScript
* Modern React with Redux
* Typescript: The Complete Developer's Guide
* Ethereum and Solidity: The Complete Developer's Guide
* Modern GraphQL with Node - Complete Developers Guide
* Progressive Web Apps (PWA) - The Complete Guide
* React Native - The Practical Guide [2022]
* The Complete React Native + Hooks Course
HTML,
            'type' => 'education',
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
            ResumeExperience::create($data);
        }
    }
}
