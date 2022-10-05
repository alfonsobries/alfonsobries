<?php

namespace App\Http\Controllers;

use App\Models\ResumeProject;
use Illuminate\Database\Eloquent\Collection;

class ResumeProjectController extends Controller
{
    public function __invoke(): Collection
    {
        return ResumeProject::ordered()->get();
    }
}
