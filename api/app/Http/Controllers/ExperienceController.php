<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use Illuminate\Database\Eloquent\Collection;

class ExperienceController extends Controller
{
    public function __invoke(): Collection
    {
        return Experience::ordered()->get();
    }
}
