<?php

namespace App\Http\Controllers;

use App\Models\LineContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LineContactController extends Controller
{
    /**
     * Names, notes, favorites and the local block list. Blocking silences
     * notifications for the contact; their history still gets recorded.
     */
    public function update(Request $request, LineContact $lineContact): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'blocked' => ['sometimes', 'boolean'],
            'favorite' => ['sometimes', 'boolean'],
        ]);

        $lineContact->update($validated);

        return response()->json(['data' => $lineContact->toApiPayload()]);
    }
}
