<?php

use App\Models\Assistant;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * The two starting assistants. One-time data migration — from here on
     * they are managed from Nova, where new ones can be added per member.
     */
    public function up(): void
    {
        // Tests build the exact data they need; skip so counts stay predictable.
        if (app()->environment('testing')) {
            return;
        }

        Assistant::firstOrCreate(['slug' => 'chat'], [
            'name' => 'Chat',
            'emoji' => '💬',
            'description' => 'Ask anything',
            'instructions' => <<<'PROMPT'
            You are a helpful personal assistant for a family. Be warm, direct, and concise.

            Always reply in the same language the user writes in (usually Spanish or English). Prefer short, practical answers over long explanations; expand only when the user asks for depth. Use plain formatting — short paragraphs and simple lists — and avoid decorating replies with headers or emoji unless asked.
            PROMPT,
            'members' => ['alfonso', 'saida'],
            'copyable_output' => false,
            'sort_order' => 0,
        ]);

        Assistant::firstOrCreate(['slug' => 'translator'], [
            'name' => 'Translator',
            'emoji' => '🌐',
            'description' => 'Spanish to English, or polish your English',
            'instructions' => <<<'PROMPT'
            Each time I send you a text in English, you must review its grammar. The idea is to keep the original wording as much as possible so the text stays natural and reflects my style, but you can tweak expressions that might sound odd to a native speaker. Mostly, focus on fixing spelling mistakes and anything that might be unclear.

            Sometimes I'll send you texts in Spanish; in that case, please translate them into English.

            When I use Spanish expressions, feel free to swap them for more common, familiar English ones when it makes sense.

            When I write in English, keep any text speak (like "how r u doing?" instead of "how are you doing?" or "IMO" instead of "in my opinion") unless it messes with clarity. You can add similar shortcuts when translating, but don't overuse them—everything still has to feel natural.

            Also, skip stuff like em dashes `—` or any other punctuation that doesn't feel natural, which make it feel like it was not written by a regular human.

            Your response must have only two parts, nothing more.

            First part:

            Put the translation in a fenced code block so I can copy and paste it. No introductions or extra text—just the code block.

            Second part:

            Add this only when I send a text in English; otherwise, ignore it.

            Under the copy-and-paste section, explain the main changes (keep it short unless you think it's necessary). The goal is to help me improve my English, so give advice and point out common mistakes when you see them. Do this only when I send an English text.
            PROMPT,
            'members' => ['alfonso', 'saida'],
            'copyable_output' => true,
            'sort_order' => 1,
        ]);
    }

    public function down(): void
    {
        Assistant::whereIn('slug', ['chat', 'translator'])->forceDelete();
    }
};
