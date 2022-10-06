<?php

namespace Database\Seeders;

use App\Models\ResumeSkill;
use Illuminate\Database\Seeder;

class ResumeSkillSeeder extends Seeder
{
    protected $initialData = [
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Laravel',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'VueJs',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'React',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'React Native',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Redux',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Next.js',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Alpine.js',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'NuxtJS',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Vuex',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Tailwind',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Bootstrap',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],

        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'PHP',
            'category' => ResumeSkill::CATEGORY_LANGUAGE,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'SQL',
            'category' => ResumeSkill::CATEGORY_LANGUAGE,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'JS',
            'category' => ResumeSkill::CATEGORY_LANGUAGE,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'TypeScript',
            'category' => ResumeSkill::CATEGORY_LANGUAGE,
        ],

        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'MySQL/PostgreSQL',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Redis',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'TDD',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Restful APIs',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Mocha & Test',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Scrum',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'CI',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Sass/Less/Stylus',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Webpack',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_EXPERT,
            'name' => 'Linux Servers',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],

        [
            'level' => ResumeSkill::LEVEL_ADVANCED,
            'name' => 'Web3',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],
        [
            'level' => ResumeSkill::LEVEL_ADVANCED,
            'name' => 'Solidity',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],
        [
            'level' => ResumeSkill::LEVEL_ADVANCED,
            'name' => 'Gridsome',
            'category' => ResumeSkill::CATEGORY_FRAMEWORK,
        ],

        [
            'level' => ResumeSkill::LEVEL_ADVANCED,
            'name' => 'Blockchain',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_ADVANCED,
            'name' => 'GraphQL',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_ADVANCED,
            'name' => 'Docker',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_ADVANCED,
            'name' => 'Elastic Search',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_ADVANCED,
            'name' => 'AWS',
            'category' => ResumeSkill::CATEGORY_OTHER,
        ],
        [
            'level' => ResumeSkill::LEVEL_ADVANCED,
            'name' => 'Apache Cordova',
            'category' => ResumeSkill::CATEGORY_OTHER,
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
            ResumeSkill::create($data);
        }
    }
}
