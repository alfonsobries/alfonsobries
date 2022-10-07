<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;

class ProjectController extends Controller
{
    public function __invoke(): Collection
    {
        return Project::ordered()->get();
    }
}
