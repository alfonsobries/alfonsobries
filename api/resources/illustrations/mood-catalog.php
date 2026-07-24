<?php

/*
 * The non-progressive emotion catalog for Regina and Andrés. Every portrait is
 * generated independently from the same canonical style sheet and existing
 * app avatar, so no emotion is treated as better, worse, earlier or later.
 *
 * Prompts focus on facial and upper-body cues that remain legible in a small
 * app catalog tile. They intentionally avoid scenes and props: the child and
 * the emotion are the whole image.
 */

return [
    'members' => [
        'regina' => [
            'name' => 'Regina',
            'reference' => 'illustrations/regina-style-reference.png',
            'avatar' => '../app/assets/regina.png',
        ],
        'andres' => [
            'name' => 'Andrés',
            'reference' => 'illustrations/andres-style-reference.png',
            'avatar' => '../app/assets/andres.png',
        ],
    ],

    'emotions' => [
        'happy' => [
            'label' => 'Feliz',
            'prompt' => 'A bright natural smile, cheerful open eyes and relaxed shoulders.',
        ],
        'sad' => [
            'label' => 'Triste',
            'prompt' => 'Downturned mouth, lowered gaze, slightly drooping shoulders and one or two gentle tears.',
        ],
        'angry' => [
            'label' => 'Enojado/a',
            'prompt' => 'Knitted eyebrows, a clear frown, puffed cheeks and small clenched hands held near the chest; upset but never threatening.',
        ],
        'scared' => [
            'label' => 'Asustado/a',
            'prompt' => 'Wide worried eyes, raised eyebrows, a small open mouth and hands held close to the chest; vulnerable but not horrifying.',
        ],
        'surprised' => [
            'label' => 'Sorprendido/a',
            'prompt' => 'Very raised eyebrows, wide bright eyes and a round open mouth, with hands lifted beside the cheeks.',
        ],
        'disgusted' => [
            'label' => 'Con asco',
            'prompt' => 'Wrinkled nose, one eyebrow raised, squinting eyes and lips pulled to one side in a clear yucky expression.',
        ],
        'excited' => [
            'label' => 'Emocionado/a',
            'prompt' => 'Huge delighted smile, sparkling wide eyes, raised shoulders and small fists lifted in eager anticipation.',
        ],
        'proud' => [
            'label' => 'Orgulloso/a',
            'prompt' => 'Warm confident smile, chin slightly raised, shoulders back and hands resting proudly at the waist.',
        ],
        'loved' => [
            'label' => 'Querido/a',
            'prompt' => 'Soft peaceful smile, tender eyes and both hands resting over the heart, feeling deeply cared for.',
        ],
        'grateful' => [
            'label' => 'Agradecido/a',
            'prompt' => 'Warm appreciative smile, softened eyes and hands gently clasped near the heart.',
        ],
        'calm' => [
            'label' => 'Tranquilo/a',
            'prompt' => 'Peaceful closed or half-closed eyes, a tiny content smile and completely relaxed shoulders.',
        ],
        'hopeful' => [
            'label' => 'Esperanzado/a',
            'prompt' => 'Gentle optimistic smile, bright eyes looking slightly upward and an open relaxed posture.',
        ],
        'curious' => [
            'label' => 'Curioso/a',
            'prompt' => 'Head tilted to one side, one eyebrow slightly raised, attentive eyes and a small interested smile.',
        ],
        'playful' => [
            'label' => 'Juguetón/a',
            'prompt' => 'Mischievous sideways smile, lively eyes and a playful head tilt, sweet rather than naughty.',
        ],
        'bored' => [
            'label' => 'Aburrido/a',
            'prompt' => 'Half-lidded eyes, flat mouth, head leaning into one hand and slumped shoulders.',
        ],
        'tired' => [
            'label' => 'Cansado/a',
            'prompt' => 'Heavy half-closed eyes, a small yawn covered by one hand and softly drooping shoulders.',
        ],
        'nervous' => [
            'label' => 'Nervioso/a',
            'prompt' => 'Uneasy eyes glancing slightly sideways, raised inner eyebrows, a tense little mouth and hands fidgeting together.',
        ],
        'confused' => [
            'label' => 'Confundido/a',
            'prompt' => 'Uneven raised eyebrows, eyes looking to one side, a puzzled mouth and one hand lightly touching the chin.',
        ],
        'frustrated' => [
            'label' => 'Frustrado/a',
            'prompt' => 'Eyes squeezed shut, eyebrows drawn together, cheeks puffed and hands held tensely near the body; strong kid frustration without aggression.',
        ],
        'worried' => [
            'label' => 'Preocupado/a',
            'prompt' => 'Raised inner eyebrows, concerned eyes, a small downturned mouth and hands gently clasped together.',
        ],
        'lonely' => [
            'label' => 'Solo/a',
            'prompt' => 'Quiet sad eyes looking downward, a small closed frown and arms softly hugging the body.',
        ],
        'disappointed' => [
            'label' => 'Decepcionado/a',
            'prompt' => 'Eyes lowered, eyebrows sloping upward in the middle, lips pressed into a disappointed frown and shoulders dropped.',
        ],
        'jealous' => [
            'label' => 'Celoso/a',
            'prompt' => 'Sideways glance, slightly knitted eyebrows, a small pout and arms folded loosely; recognizable but never mean.',
        ],
        'embarrassed' => [
            'label' => 'Avergonzado/a',
            'prompt' => 'Shy averted eyes, an awkward tiny smile, shoulders tucked in and hands held near the cheeks; no colored blush.',
        ],
    ],
];
