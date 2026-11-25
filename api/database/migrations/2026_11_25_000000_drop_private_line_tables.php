<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The private line's create migrations, parents first.
     *
     * @var list<string>
     */
    private const CREATE_MIGRATIONS = [
        '2026_08_20_000000_create_line_contacts_table.php',
        '2026_08_20_000100_create_line_messages_table.php',
        '2026_08_20_000200_create_line_calls_table.php',
        '2026_08_20_000300_create_line_voicemails_table.php',
        '2026_08_20_000400_create_line_events_table.php',
        '2026_08_20_000500_create_line_numbers_table.php',
    ];

    public function up(): void
    {
        Schema::dropIfExists('line_numbers');
        Schema::dropIfExists('line_events');
        Schema::dropIfExists('line_voicemails');
        Schema::dropIfExists('line_calls');
        Schema::dropIfExists('line_messages');
        Schema::dropIfExists('line_contacts');
    }

    public function down(): void
    {
        foreach (self::CREATE_MIGRATIONS as $file) {
            (require database_path('migrations/'.$file))->up();
        }
    }
};
