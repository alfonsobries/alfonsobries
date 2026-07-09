<?php

use App\Services\Illustrator;

it('composes a single-member prompt from the character sheet and chroma background', function () {
    $prompt = app(Illustrator::class)->composePrompt(['regina'], 'jugando con bloques');

    expect($prompt)
        ->toContain('Use the attached image as the canonical character and style reference sheet.')
        ->toContain('hand-drawn illustration')
        ->toContain('Main character: Regina')
        ->toContain('magenta #FF00FF')
        ->toContain('Subject: jugando con bloques')
        ->not->toContain('TOGETHER');
});

it('combines several members into one scene', function () {
    $prompt = app(Illustrator::class)->composePrompt(['regina', 'andres'], 'un picnic');

    expect($prompt)
        ->toContain('one per character')
        ->toContain('Main character: Regina')
        ->toContain('Main character: Andrés')
        ->toContain('Feature Regina and Andrés TOGETHER in the same composition');
});

it('keeps the style without a character when no member is picked', function () {
    $prompt = app(Illustrator::class)->composePrompt([], 'un calendario con estrellas');

    expect($prompt)
        ->toContain('ONLY as a reference for line style and palette')
        ->not->toContain('Main character:');
});

it('frames a follow-up as an edit of the previous image', function () {
    $prompt = app(Illustrator::class)->composePrompt(['regina'], 'ahora con un sombrero', isFollowUp: true);

    expect($prompt)
        ->toContain('This is a follow-up edit.')
        ->toContain('the LAST attached image')
        ->toContain('ahora con un sombrero');
});

it('never leaks the human documentation paragraphs into prompts', function () {
    $prompt = app(Illustrator::class)->composePrompt(['regina'], 'algo');

    expect($prompt)
        ->not->toContain('This file is the shared style prompt')
        ->not->toContain('IllustrationProcessor');
});
