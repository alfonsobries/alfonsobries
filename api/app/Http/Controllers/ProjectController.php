<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;

class ProjectController extends Controller
{
    public function __invoke(): Collection
    {
        info( Project::ordered()->published()->get());
        return Project::ordered()->published()->get();
    }
}
