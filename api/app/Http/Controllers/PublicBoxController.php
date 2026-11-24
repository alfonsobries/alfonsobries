<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Box;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\App;

/**
 * What a box's QR label opens in a browser: a read-only page listing what is
 * inside. The token in the URL is the only key, so it shows names, counts and
 * pictures and nothing else, and stays out of search engines.
 */
class PublicBoxController extends Controller
{
    public function __invoke(Request $request, string $token): Response
    {
        $box = Box::query()->with('items.media')->where('token', $token)->firstOrFail();

        App::setLocale($request->getPreferredLanguage(['es', 'en']) ?? 'es');

        return response()
            ->view('boxes.public', [
                'box' => $box,
                'appUrl' => config('site.app_scheme').'://b/'.$box->token,
            ])
            ->header('X-Robots-Tag', 'noindex, nofollow')
            ->header('Cache-Control', 'no-cache, private');
    }
}
