<?php

namespace App\Http\Controllers;

use App\Models\ResumeExperience;
use App\Models\ResumeProject;

class ResumeControler extends Controller
{
    public function __invoke(): array
    {
        return [
            'experience' => ResumeExperience::ordered()->get(),
            'projects' => ResumeProject::ordered()->get()
        ];
    }
}
