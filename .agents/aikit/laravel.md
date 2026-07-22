<!-- aikit v0.2.0 - managed file, do not edit -->

# Laravel

Conventions for Laravel apps, on top of whatever `laravel/boost` provides.

## Errors and observability

- Report significant failures with `report($e)` (or `\Sentry\captureMessage()` for non-exceptional events) - never `Log::error` as the only signal. A log line nobody tails is where incidents die.
- When a failure affects a user, tell them (notification or localized response), not silence.

## Performance

- Eager-load relations; treat any N+1 as a bug. When a view or DTO touches a relation, verify the query loads it.

## Authorization

- Controllers authorize with `$this->authorize(...)` (the `AuthorizesRequests` trait), never inline `Gate::` calls.
- Permission logic lives in policies/gates. When the UI needs it, expose a `can` map on the DTO (one boolean per ability, filled from the gate) - the frontend renders the backend's decision, never recomputes it.
- Hidden means not sent: when a permission hides data, omit the value from the payload instead of trusting the UI to hide it.

## Dates

- Serialize dates as ISO 8601 with offset (`$model->created_at?->toIso8601String()`); store UTC. Never pre-format for display (`->format('Y-m-d')`, `->toDateString()`) - the frontend formats through its shared helpers.

## Migrations

- While the project has no production database, keep migrations clean: edit the original create migration and reset, instead of stacking alter-table migrations.

## i18n

- User-facing strings are translation keys in lang files, never literals in code - including `ValidationException`, `abort()` messages, and notification copy. All locales change in the same PR.
- Admin-only surfaces (Nova and similar) stay plain English, no translation.

## Frontend types

- Expose API shapes through DTOs (`spatie/laravel-data`) annotated with `#[TypeScript]`, and regenerate the frontend types after changing them.

## Seeders and factories

- Realistic data in the product's locale (real cities, plausible names and prices), not lorem ipsum.
