<?php

namespace App\Http\Middleware;

use Illuminate\Support\Facades\App;
use Illuminate\Auth\Middleware\Authenticate as Middleware;

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

    private function isValidLocale($locale)
    {
        return in_array($locale, ['en', 'es']);
    }
}
