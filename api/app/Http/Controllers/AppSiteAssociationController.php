<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

/**
 * Tells iOS which paths on this domain belong to the app, so scanning a box
 * label opens the box in the app instead of the browser when it's installed.
 */
class AppSiteAssociationController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $appId = config('services.apple.team_id').'.'.config('services.apple.client_id');

        return response()->json([
            'applinks' => [
                'details' => [
                    [
                        'appIDs' => [$appId],
                        'components' => [
                            ['/' => '/b/*', 'comment' => 'Box labels'],
                        ],
                    ],
                ],
            ],
        ]);
    }
}
