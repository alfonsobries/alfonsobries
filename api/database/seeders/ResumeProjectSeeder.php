<?php

namespace Database\Seeders;

use App\Models\ResumeProject;
use Illuminate\Database\Seeder;

class ResumeProjectSeeder extends Seeder
{
    protected $initialData = [
        [
            'title' => 'Vue-Tailwind',
            'description' => 'Created VueTailwind: a popular library of Vue components (+10k visits per month and about 2k stats in Github) with fully configurable theme classes that don\'t depend on any CSS frameworks but are by default styled with TailwindCSS.',
            'url' => 'https://vue-tailwind.com',
        ],
        [
            'title' => 'VariantJS',
            'description' => 'VariantJS is the next version of the VueTailwind package built from scratch for Vue 3 and React.',
            'url' => 'https://github.com/variantjs',
        ],
        [
            'title' => 'Dona.me',
            'description' => 'Dona.me is a tool that allows nonprofit organizations to create a website to share their work, receive monthly financial contributions, and keep in touch with people who support them',
            'url' => 'https://www.dona.me',
        ],
        [
            'title' => 'React use-form',
            'description' => 'React hook for handling form states, requests, and validation, compatible with React and React Native.',
            'url' => 'https://github.com/alfonsobries/react-use-form',
        ],
        [
            'title' => 'Others',
            'description' => 'Explore my Github profile for other open source tools and experiments like this [minesweeper clone](https://vue-minesweeper.vercel.app/) or this [movies search engine](https://movjs.vercel.app/).',
            'url' => 'https://github.com/alfonsobries',
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
            ResumeProject::create($data);
        }
    }
}
