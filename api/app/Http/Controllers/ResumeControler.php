<?php

namespace App\Http\Controllers;

use App\Models\ResumeExperience;
use App\Models\ResumeProject;
use App\Models\ResumeSkill;

class ResumeControler extends Controller
{
    public function __invoke(): array
    {
        return [
            'experience' => ResumeExperience::ordered()->get(),
            'projects' => ResumeProject::ordered()->get(),
            'skills' => ResumeSkill::ordered()->get(),
        ];
    }
}
