<?php

declare(strict_types=1);

namespace App\Climate;

use App\Models\Setting;
use App\Models\User;
use App\Notifications\ClimateAutomationNotification;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * Switches the air conditioners off when neither parent is home, and back on
 * (the same units, with their settings) when one of them returns.
 *
 * It acts once per absence: anything switched on remotely while everyone is
 * out stays on. A parent whose phone never reported a location counts as home,
 * so a missing report can never switch the house off.
 */
class ClimateAutomation
{
    public const SETTING_KEY = 'climate.automation';

    /**
     * How long everyone has to be out before acting, so a quick trip to the
     * gate or a jittery GPS fix doesn't cut the cooling.
     */
    public const GRACE_MINUTES = 5;

    public const DEFAULT_RADIUS = 150;

    /** The language the household reads notifications in. */
    private const LOCALE = 'es';

    public function __construct(private readonly Climate $climate) {}

    /**
     * @return array{enabled: bool, home: array{latitude: float, longitude: float, radius: int}|null, switched_off: list<string>|null, complete: bool}
     */
    public function settings(): array
    {
        /** @var array<string, mixed> $stored */
        $stored = Setting::get(self::SETTING_KEY, []);

        return [
            'enabled' => (bool) ($stored['enabled'] ?? true),
            'home' => $stored['home'] ?? null,
            'switched_off' => $stored['switched_off'] ?? null,
            'complete' => (bool) ($stored['complete'] ?? false),
        ];
    }

    /**
     * @param  array{enabled?: bool, home?: array{latitude: float, longitude: float, radius?: int}}  $changes
     */
    public function configure(array $changes): void
    {
        $settings = $this->settings();

        if (array_key_exists('enabled', $changes)) {
            $settings['enabled'] = $changes['enabled'];

            // Turning it off forgets a pending restore instead of acting on stale state.
            if (! $changes['enabled']) {
                $settings['switched_off'] = null;
                $settings['complete'] = false;
            }
        }

        if (isset($changes['home'])) {
            $settings['home'] = [
                'latitude' => (float) $changes['home']['latitude'],
                'longitude' => (float) $changes['home']['longitude'],
                'radius' => (int) ($changes['home']['radius'] ?? self::DEFAULT_RADIUS),
            ];
        }

        $this->save($settings);
    }

    /**
     * @return array{enabled: bool, home: array{latitude: float, longitude: float, radius: int}|null, switched_off: list<string>, people: list<array{member: string, name: string, presence: string|null, changed_at: string|null}>}
     */
    public function toArray(): array
    {
        $settings = $this->settings();

        return [
            'enabled' => $settings['enabled'],
            'home' => $settings['home'],
            'switched_off' => $settings['switched_off'] ?? [],
            'people' => $this->parents()->map(fn (User $parent): array => [
                'member' => (string) $parent->family_member,
                'name' => (string) $parent->name,
                'presence' => $parent->presence?->value,
                'changed_at' => $parent->presence_changed_at?->toIso8601String(),
            ])->values()->all(),
        ];
    }

    public function recordPresence(User $user, Presence $presence): void
    {
        if ($user->presence !== $presence) {
            $user->forceFill(['presence' => $presence, 'presence_changed_at' => now()])->save();
        }

        if ($presence === Presence::Home) {
            $this->restore($user);
        }
    }

    /**
     * The periodic check: switch off once everyone has been out long enough,
     * and retry anything a previous run could not reach.
     */
    public function enforce(): void
    {
        $settings = $this->settings();

        if (! $settings['enabled'] || ! $this->climate->isConfigured()) {
            return;
        }

        if (! $this->everyoneAway()) {
            if ($settings['switched_off'] !== null) {
                $this->restore(null);
            }

            return;
        }

        if ($settings['complete'] || $this->lastDeparture()?->gt(now()->subMinutes(self::GRACE_MINUTES))) {
            return;
        }

        $result = $this->climate->turnOffAll();
        $alreadyOff = $settings['switched_off'] ?? [];

        $this->save([
            ...$settings,
            'switched_off' => array_values(array_unique([...$alreadyOff, ...$result['switched_off']])),
            'complete' => $result['failed'] === [],
        ]);

        if ($result['switched_off'] !== []) {
            $count = count($result['switched_off']);
            $this->notifyParents(
                __('climate.switched_off_title', [], self::LOCALE),
                trans_choice('climate.switched_off_body', $count, ['count' => $count], self::LOCALE),
            );
        }
    }

    public function everyoneAway(): bool
    {
        $parents = $this->parents();

        return $parents->isNotEmpty() && $parents->every(fn (User $parent): bool => $parent->presence === Presence::Away);
    }

    private function restore(?User $arrived): void
    {
        $settings = $this->settings();
        $pending = $settings['switched_off'];

        if ($pending === null || ! $settings['enabled']) {
            return;
        }

        $turnedOn = $pending === [] ? [] : $this->climate->turnOn($pending);
        $remaining = array_values(array_diff($pending, $turnedOn));

        $this->save([
            ...$settings,
            'switched_off' => $remaining === [] ? null : $remaining,
            'complete' => false,
        ]);

        if ($turnedOn !== []) {
            $count = count($turnedOn);
            $this->notifyParents(
                __('climate.switched_on_title', [], self::LOCALE),
                trans_choice('climate.switched_on_body', $count, [
                    'count' => $count,
                    'name' => $arrived !== null ? strtok((string) $arrived->name, ' ') : 'Alguien',
                ], self::LOCALE),
            );
        }
    }

    private function lastDeparture(): ?CarbonInterface
    {
        return $this->parents()->max(fn (User $parent): ?CarbonInterface => $parent->presence_changed_at);
    }

    /**
     * @return Collection<int, User>
     */
    private function parents(): Collection
    {
        return User::query()->whereIn('family_member', User::MOOD_MEMBERS)->orderBy('family_member')->get();
    }

    private function notifyParents(string $title, string $body): void
    {
        $this->parents()->each(fn (User $parent) => $parent->notify(new ClimateAutomationNotification($title, $body)));
    }

    /**
     * @param  array{enabled: bool, home: array{latitude: float, longitude: float, radius: int}|null, switched_off: list<string>|null, complete: bool}  $settings
     */
    private function save(array $settings): void
    {
        Setting::put(self::SETTING_KEY, $settings);
    }
}
