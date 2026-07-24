<?php

namespace App\Family;

enum KidEmotion: string
{
    case Happy = 'happy';
    case Sad = 'sad';
    case Angry = 'angry';
    case Scared = 'scared';
    case Surprised = 'surprised';
    case Disgusted = 'disgusted';
    case Excited = 'excited';
    case Proud = 'proud';
    case Loved = 'loved';
    case Grateful = 'grateful';
    case Calm = 'calm';
    case Hopeful = 'hopeful';
    case Curious = 'curious';
    case Playful = 'playful';
    case Bored = 'bored';
    case Tired = 'tired';
    case Nervous = 'nervous';
    case Confused = 'confused';
    case Frustrated = 'frustrated';
    case Worried = 'worried';
    case Lonely = 'lonely';
    case Disappointed = 'disappointed';
    case Jealous = 'jealous';
    case Embarrassed = 'embarrassed';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
