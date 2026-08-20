<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAlfonso
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isAlfonso()) {
            return response()->json(['message' => 'Only Alfonso can use the private line.'], 403);
        }

        return $next($request);
    }
}
