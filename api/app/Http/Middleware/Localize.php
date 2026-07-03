<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Support\Facades\App;

class Localize extends Middleware
{
    public function handle($request, \Closure $next, ...$guards)
    {
        $locale = $request->header('Accept-Language');

        if (! $this->isValidLocale($locale)) {
            $locale = config('app.locale');
        }

        App::setLocale($locale);

        return $next($request);
    }

    /**
     * @param  string|array<mixed>|null  $locale
     */
    private function isValidLocale(string|array|null $locale): bool
    {
        return in_array($locale, ['en', 'es']);
    }
}
