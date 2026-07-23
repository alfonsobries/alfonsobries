<?php

/*
 * Virtue landscape series — 30 stages × 3 layers (earth / sky / tree).
 * Style: epic flat grain (see virtue-landscape-style.png). Each stage is one
 * small step further along the same arc: abyss → path → summit. Light follows
 * virtue. No rivers in the foreground; distant horizon water band only.
 */

return [
    'reference' => 'illustrations/virtue-landscape-style.png',

    'style' => 'Match the attached style sheet exactly: epic flat grain, stipple
        texture inside flat shapes, hard cuttable edges, sheet palette. No labels,
        no text, no humans, no animals, no foreground rivers or streams.',

    'chroma' => 'Fill the ENTIRE canvas background with solid flat pure magenta
        #FF00FF. Subject pixels touch magenta directly — no white/cream outline,
        no die-cut sticker border. Never use magenta/pink/purple inside the subject.',

    'earth' => [
        'role' => 'SIMPLE LAYER — GROUND / BODY ONLY. A single earth mound in the
            lower half, centered. No tree, no sky, no sun, no moon, no clouds.',
        'stages' => [
            1 => 'Abyss: cracked barren nearly-black earth mound, bone-dry, deep fissures, no green.',
            2 => 'Same mound, cracks slightly less severe; a faint cooler tone at the peak.',
            3 => 'Still barren and dark; one tiny pale pebble near the crest.',
            4 => 'Dark dry earth; cracks beginning to soften at the base.',
            5 => 'Deep brown mound; a hairline of slightly richer soil along the ridge.',
            6 => 'Dry mound with a first hint of olive-brown where cracks meet.',
            7 => 'Barren but less shattered; one tiny dry tuft of dead grass.',
            8 => 'Dark earth with a few small stones; first cool shadow on the lee side.',
            9 => 'Mound firming up; sparse pale dust, one thin dry stem.',
            10 => 'Still mostly bare; soil a shade warmer, cracks narrower.',
            11 => 'Path begins: deeper brown soil, a few scattered stones, one tiny green speck.',
            12 => 'Solid mound; two small grass tufts, rocks at the base.',
            13 => 'Earth with sparse short grass patches and a few stones.',
            14 => 'Richer soil; several grass clumps, low rocks.',
            15 => 'Mid path: solid deep earth, scattered rocks, small green grass tufts across the mound.',
            16 => 'Grass covering more of the crown; rocks nestled in soil.',
            17 => 'Lusher short grass; soil between tufts is warm brown.',
            18 => 'Continuous grass veil over most of the mound; a few pale stones.',
            19 => 'Green meadow taking hold; soft rocks, denser grass.',
            20 => 'Thick grass carpet; mound reads alive, still a few bare patches.',
            21 => 'Summit approach: rich green cover, mossy stones.',
            22 => 'Lush meadow mound; small white flower dots begin.',
            23 => 'Dense grass and a handful of tiny white wildflowers.',
            24 => 'Full green with scattered white blooms and warm stones.',
            25 => 'Flourishing meadow; flowers more frequent, soil almost hidden.',
            26 => 'Lush green mound dotted with white flowers; soft rock accents.',
            27 => 'Near summit: dense meadow, many small white flowers, mossy stones.',
            28 => 'Almost complete green cover; flowers bright against leaf green.',
            29 => 'Summit-ready: rich meadow, flowers, warm stones — only tiny soil gaps.',
            30 => 'Summit: vibrant green meadow mound filled with grass, rocks, and small white flowers.',
        ],
    ],

    'sky' => [
        'role' => 'FULL-BLEED LAYER — SKY / MIND ONLY. Sky fills the entire canvas.
            Include a thin distant water band at the horizon. No tree, no ground mound,
            no foreground land.',
        'stages' => [
            1 => 'Abyss night: near-black night sky, thin pale crescent moon high, faint stars, cold distant water band.',
            2 => 'Deep night; crescent a touch brighter; still nearly black.',
            3 => 'Night sky with a few more stars; moon thin.',
            4 => 'Very dark blue-black; crescent moon; horizon water barely visible.',
            5 => 'Night easing a fraction; indigo undertone under the moon.',
            6 => 'Dark indigo sky; crescent still present; cool mist near horizon.',
            7 => 'Pre-dawn indigo; moon smaller; faint warm edge on the water band.',
            8 => 'Deep blue predawn; first hint of lighter band above the water.',
            9 => 'Cool dark blue; moon fading; horizon slightly brighter.',
            10 => 'Late night into predawn; soft gradient from dark above to cooler horizon.',
            11 => 'Path dawn begins: dark blue upper sky, first peach/gold line on the water.',
            12 => 'Dawn: cooler blue with a low warm glow on the horizon water.',
            13 => 'Soft dawn gradient; low pale sun disk just kissing the water.',
            14 => 'Dawn sky bluer; low sun stronger on the water band.',
            15 => 'Mid path dawn: cool blue-grey sky, glowing low sun on the water horizon.',
            16 => 'Brighter dawn; sun climbs a little; soft cool clouds appear.',
            17 => 'Morning blue; sun higher; thin cool-mist clouds.',
            18 => 'Clearer day sky; sun mid-low; soft white cloud shapes.',
            19 => 'Day opening: brighter blue, sun clearer, light clouds.',
            20 => 'Blue day sky; sun warm gold; soft clouds drifting.',
            21 => 'Summit approach: bright day blue, high sun beginning.',
            22 => 'Clear day; sun higher; soft white clouds.',
            23 => 'Bright sky; strong sun; cool-mist cloud patches.',
            24 => 'Full day blue; high golden sun; soft clouds.',
            25 => 'Radiant day; sun near peak; light airy clouds.',
            26 => 'Bright day sky; high sun gold; soft cloud bands.',
            27 => 'Near summit light: luminous blue, high sun, gentle clouds.',
            28 => 'Almost peak daylight; sun high and golden; soft clouds.',
            29 => 'Summit-ready sky: bright day blue, high sun, airy cool-mist clouds.',
            30 => 'Summit: bright day sky, high golden sun, soft white/cool-mist clouds, clear water horizon.',
        ],
    ],

    'tree' => [
        'role' => 'SIMPLE STICKER LAYER — TREE / SPIRIT ONLY. One plant, centered.
            No personal soil mound under it (roots will plant into the earth layer).
            No landscape, no sky. Same tree identity growing across all stages.',
        'stages' => [
            1 => 'Abyss: tiny dead stick or seed-sprout, almost leafless, barely alive.',
            2 => 'Slightly taller dry stick; one hairline bud.',
            3 => 'Thin dry stem; first tiny dormant bud.',
            4 => 'Short stick with a second faint bud node.',
            5 => 'Small dry sapling stem; no real leaves yet.',
            6 => 'Thin stem with a first microscopic green tip.',
            7 => 'Short sprout; one tiny green leaf beginning.',
            8 => 'Young sprout with two tiny leaves.',
            9 => 'Small seedling; a few small leaves, thin trunk.',
            10 => 'Ankle-high seedling; sparse small leaves.',
            11 => 'Young sapling; thin trunk, small sparse canopy starting.',
            12 => 'Sapling taller; a few short branches, light leaf clusters.',
            13 => 'Young tree forming; trunk clearer, small branch forks.',
            14 => 'Sapling with a small open crown of leaves.',
            15 => 'Mid path: growing sapling, visible trunk, small branches, modest leaf clusters.',
            16 => 'Taller sapling; denser small canopy.',
            17 => 'Young tree; trunk thicker, rounded small crown.',
            18 => 'Tree filling out; more leaves, stronger branches.',
            19 => 'Sturdy young tree; fuller rounded canopy.',
            20 => 'Healthy tree; thickish trunk, dense leafy crown growing.',
            21 => 'Summit approach: strong trunk, broad leafy canopy.',
            22 => 'Large tree; canopy spreading wider.',
            23 => 'Mature tree; thick trunk, lush rounded crown.',
            24 => 'Grand tree; dense leaf mass, strong limbs.',
            25 => 'Near-ancient oak feel; full canopy, thick bark planes.',
            26 => 'Massive canopy; trunk broad, roots hinted at base (no soil disk).',
            27 => 'Near summit tree: thick trunk, huge leafy crown.',
            28 => 'Almost final: ancient broadleaf, dense green canopy.',
            29 => 'Summit-ready: immense trunk and full lush canopy.',
            30 => 'Summit: massive ancient oak-like tree, thick trunk, full dense leafy canopy.',
        ],
    ],
];
