<?php

namespace Database\Seeders;

use App\Models\LineCall;
use App\Models\LineContact;
use App\Models\LineMessage;
use App\Models\LineNumber;
use App\Models\LineVoicemail;
use Illuminate\Database\Seeder;

/**
 * Fake private-line history so the app can be walked through without a
 * provider key. Numbers are invented; never the real line.
 */
class LineDemoSeeder extends Seeder
{
    public function run(): void
    {
        LineVoicemail::query()->delete();
        LineCall::query()->delete();
        LineMessage::query()->delete();
        LineContact::query()->delete();
        LineNumber::query()->delete();

        LineNumber::factory()->create([
            'provider_id' => 'num_demo',
            'e164' => '+525500001111',
            'display' => '55 0000 1111',
            'status' => 'active',
            'billing_period' => 'monthly',
            'renews_at' => now()->addDays(18),
            'auto_renew' => true,
            'balance_usd' => 24.5,
        ]);

        $mama = LineContact::factory()->create([
            'e164' => '+525511110101',
            'name' => 'Mamá',
            'favorite' => true,
        ]);
        $sat = LineContact::factory()->create([
            'e164' => '+525588001122',
            'name' => 'SAT',
        ]);
        $escuela = LineContact::factory()->create([
            'e164' => '+525544332211',
            'name' => 'Escuela',
        ]);
        $unknown = LineContact::factory()->create([
            'e164' => '+525577889900',
            'name' => null,
        ]);

        LineMessage::factory()->create([
            'line_contact_id' => $mama->id,
            'direction' => LineMessage::DIRECTION_IN,
            'body' => '¿Ya vas saliendo?',
            'status' => LineMessage::STATUS_RECEIVED,
            'provider_created_at' => now()->subMinutes(40),
            'read_at' => null,
        ]);
        LineMessage::factory()->outbound()->create([
            'line_contact_id' => $mama->id,
            'body' => 'En 10 minutos',
            'provider_created_at' => now()->subMinutes(38),
            'status' => LineMessage::STATUS_DELIVERED,
            'delivered_at' => now()->subMinutes(37),
        ]);

        LineMessage::factory()->create([
            'line_contact_id' => $sat->id,
            'direction' => LineMessage::DIRECTION_IN,
            'body' => 'SAT: Tu código de verificación es 482917. No lo compartas.',
            'status' => LineMessage::STATUS_RECEIVED,
            'provider_created_at' => now()->subHours(2),
            'read_at' => null,
        ]);

        LineMessage::factory()->create([
            'line_contact_id' => $escuela->id,
            'direction' => LineMessage::DIRECTION_IN,
            'body' => 'Junta de padres mañana a las 8:00 en el aula 3.',
            'status' => LineMessage::STATUS_RECEIVED,
            'provider_created_at' => now()->subDay(),
            'read_at' => now()->subHours(20),
        ]);

        LineCall::factory()->missed()->create([
            'line_contact_id' => $unknown->id,
            'started_at' => now()->subHours(3),
            'ended_at' => now()->subHours(3)->addSeconds(18),
            'seen_at' => null,
        ]);

        LineCall::factory()->create([
            'line_contact_id' => $mama->id,
            'direction' => LineCall::DIRECTION_OUT,
            'status' => LineCall::STATUS_COMPLETED,
            'started_at' => now()->subDays(2),
            'answered_at' => now()->subDays(2)->addSeconds(8),
            'ended_at' => now()->subDays(2)->addMinutes(4),
            'duration_sec' => 240,
            'seen_at' => now()->subDays(2),
        ]);

        LineVoicemail::factory()->create([
            'line_contact_id' => $unknown->id,
            'transcript' => 'Hola, te llamo de la paquetería. Dejamos el paquete en recepción.',
            'summary' => 'Avisan que dejaron un paquete en recepción.',
            'sentiment' => 'neutral',
            'duration_sec' => 14,
            'received_at' => now()->subHours(3),
            'heard_at' => null,
        ]);
    }
}
