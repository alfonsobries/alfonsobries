<?php

use App\Models\ResumeExperience;
use App\Models\ResumeProject;
use App\Models\ResumeSkill;

it('returns experience, projects and skills', function () {
    ResumeSkill::factory()->count(3)->create();
    ResumeProject::factory()->count(2)->create();
    ResumeExperience::factory()->count(1)->create();

    $response = $this->getJson(route('resume'));

    $response->assertSuccessful();

    expect($response->json())->toHaveKeys(['experience', 'projects', 'skills']);
    expect($response->json('projects'))->toHaveCount(2);
    expect($response->json('experience'))->toHaveCount(1);
    expect($response->json('skills'))->toHaveCount(3);
});
