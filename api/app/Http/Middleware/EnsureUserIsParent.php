<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsParent
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isParent()) {
            return response()->json(['message' => __('climate.parents_only')], 403);
        }

        return $next($request);
    }
}
