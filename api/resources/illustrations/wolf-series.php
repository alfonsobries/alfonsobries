<?php

/*
 * The 30 planned stages of the wolf mascot's arc, v2. One unique wolf is the
 * protagonist throughout; other wolves may appear only as small, simple,
 * clearly secondary background elements. Two things grow in parallel and
 * strictly monotonically, stage over stage:
 *
 *  - The wolf: from severely sick (emaciated, patchy dull fur, hollow eyes)
 *    to a LARGE OLD WISE wolf — bigger and broader than a normal wolf, thick
 *    silver mane, weathered kind face. Strength and age express his virtue;
 *    nothing angelic, no glow, no halo.
 *  - The tree of life: from a tiny seed on dry cracked ground to a huge,
 *    lush, beautiful broadleaf tree with a rounded canopy. It appears in
 *    every stage — sometimes as a foreground detail, sometimes small in the
 *    background — and is always the SAME tree, always at least slightly
 *    bigger than the stage before.
 *
 * The final PNGs are transparent, so there is no scenery beyond these
 * sticker-style elements. Activities vary stage to stage to keep the series
 * alive, but the wolf's body condition and the tree's growth never regress.
 */

return [
    'reference' => 'illustrations/wolf-style-reference.png',

    'identity' => 'The protagonist is always the SAME single wolf: warm amber-gold eyes, a small notch in the
        left ear and a small pale diamond mark on the chest, drawn in the exact line style of the sheet.
        His body, coat and age evolve across the series exactly as the subject describes — from severely
        sick, through healthy gray adult, into a large old white-maned sage — but he must always read as
        the same wolf. If the reference sheet\'s own arc panel conflicts with the subject text, the subject
        text wins. Any other wolves are small, simple, clearly secondary background elements, never rivals
        for attention. The tree of life in the subject is the same single tree in every stage and only
        ever grows. No humans.',

    'progression' => 'Draw the same wolf exactly ONE small step further along his arc than in the LAST attached
        image: a steady, linear improvement — subtle but noticeable — and he must never look less
        healthy, smaller or less dignified than in that image, and the tree must never be smaller than
        in that image. Keep the same line weight and style.',

    'stages' => [
        // Phase 1 — Sick and lost (days 0-7)
        1 => 'The wolf lies collapsed on his side on a small patch of dry, cracked earth: severely emaciated with ribs and hip bones showing, patchy thinning dull-gray fur, hollow cheeks, crusted half-closed eyes, ears flat, tail limp. Beside him on the dry ground lies a single tiny seed. The lowest point of the whole series.',
        2 => 'The severely emaciated wolf has dragged himself to lie curled next to the dry crack in the earth where the tiny seed now rests half-buried; his eyes are open a slit, dull and exhausted, fur still patchy.',
        3 => 'The emaciated wolf, still gaunt and patchy-furred, stands on four trembling legs, head hanging low, and looks down at the seed in the cracked dry soil.',
        4 => 'The gaunt wolf lies with his head resting near the crack, gently nosing the soil over the seed; his eyes show a first faint spark of attention. His fur, though thin, is a shade less matted.',
        5 => 'A tiny first sprout tip breaks through the cracked soil. The still-skinny wolf sits beside it, head half-lifted, watching it with the first hint of hope in his amber eyes.',

        // Phase 2 — Waking up (days 8-30)
        6 => 'The thin wolf stands guard over the small sprout, which now shows two tiny green leaves; his posture is straighter than before, fur beginning to even out.',
        7 => 'The thin wolf walks a slow circle around the sprout, head carried level with his back for the first time, ears half-raised, keeping it safe.',
        8 => 'The wolf, still lean but with cleaner mid-gray fur, digs the dry soil gently around the young sprout with one paw, loosening the earth for it.',
        9 => 'The lean wolf drinks from a small clear stream; the sprout, now a hand-tall seedling with a few leaves, grows at the water\'s edge beside him.',
        10 => 'The wolf shakes water off his fur in a lively spray of droplets next to the ankle-high seedling — shaking off the old; his body is starting to fill out.',
        11 => 'The wolf stands upright and dignified beside the knee-high seedling, both of them straight and alive: his fur is now an even light gray, eyes clear amber, body lean but healthy.',

        // Phase 3 — Rebuilding (days 31-90)
        12 => 'The healthy wolf trots an easy patrol around the young seedling, which now reaches half his height with a thin stem and fresh leaves; his gait is loose and confident.',
        13 => 'The wolf sniffs the ground with lively curiosity, tail relaxed and high; behind him the young sapling stands as tall as his back, its first thin branches forming.',
        14 => 'The wolf runs at full joyful stride across the frame, ears swept back with speed; the sapling, now his own height, stands small in the background.',
        15 => 'The wolf stands tall with his front paws up on a fallen log, chest out and confident; beside the log the sapling has grown clearly taller than him, with a small crown of leaves.',
        16 => 'The wolf stands square and strong facing the viewer, fully rebuilt: solid healthy build, bright light-gray coat, white chest and muzzle, steady warm amber eyes. Behind him the young tree now doubles his height, its rounded canopy taking shape.',

        // Phase 4 — Strength (days 91-180)
        17 => 'The strong wolf sits in a calm guardian pose in the shade line of the young tree, whose thin trunk and rounded leafy crown now clearly look like a small tree of life.',
        18 => 'The strong wolf climbs a rocky slope with power and focus; the growing tree stands in the background at the foot of the rocks, taller and fuller than before.',
        19 => 'The strong wolf stands calm and steady in the foreground while two much smaller, simpler wolves watch him respectfully from the far background, near the growing tree.',
        20 => 'The wolf walks at the front of three small, simple background wolves, serene and clearly the strongest; the tree, now sturdy with a dense round canopy, anchors the scene behind them.',

        // Phase 5 — Mastery (days 181-365)
        21 => 'The powerful wolf, his coat beginning to silver at the mane, stands high on a rock outcrop surveying ahead; the tree grows tall and full beside the rock.',
        22 => 'The wolf sits in a serene noble profile beneath the tree, whose branches now spread wide enough to arc over him; the first thick fur of age shows around his neck.',
        23 => 'Under a simple crescent moon and stars, the silvering wolf rests calmly against the trunk of the now-large tree — the night holds no threat anymore.',
        24 => 'The maturing wolf, visibly bigger and broader than before with a thickening silver mane, leads three small simple wolves in the background; the great tree rises behind them.',
        25 => 'The wolf stands at a small mirror-still lake, calmly looking at his reflection; the big leafy tree stands on the far shore, mirrored beside him in the water.',
        26 => 'The wolf, large and silver-maned now, howls full-chested from a rock beside the great tree, whose canopy spreads wide and lush — the howl of a year conquered.',

        // Phase 6 — The old sage (beyond one year)
        27 => 'The wolf has grown into an OLD, LARGE, powerful sage: noticeably bigger and broader than a normal wolf, thick silver-gray coat, a full white mane around his neck and chest, bushy brows, a small old scar over one eyebrow, calm deep amber eyes. He sits massive and serene under the great tree of life, now thick-trunked and magnificent.',
        28 => 'The huge old sage wolf lies in patient stillness while two small simple wolf pups play between his front paws, under the wide shade of the lush tree of life.',
        29 => 'The great old wolf stands facing the viewer in all his size — broad chest, dense silver coat, white mane, weathered wise face with kind eyes — while the tree of life behind him spreads its full, beautiful rounded canopy.',
        30 => 'The final image of the journey: the old sage wolf — huge, strong, serene, thick white-silver mane, wise weathered face — sits with quiet majesty beneath the fully grown TREE OF LIFE: a broad trunk and an immense, lush, beautiful rounded canopy in fresh greens. Two things that grew together, both fully alive. Nothing angelic — just age, strength and peace.',
    ],
];
