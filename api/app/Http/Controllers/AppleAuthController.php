<?php

namespace App\Http\Controllers;

use App\Http\Requests\AppleLoginRequest;
use App\Models\User;
use App\Services\Apple\AppleTokenVerifier;
use App\Services\Apple\InvalidAppleTokenException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AppleAuthController extends Controller
{
    public function __invoke(AppleLoginRequest $request, AppleTokenVerifier $verifier): JsonResponse
    {
        try {
            $verified = $verifier->verify($request->string('id_token')->toString());
        } catch (InvalidAppleTokenException $e) {
            return response()->json(['message' => $e->getMessage()], $e->statusCode());
        }

        $email = $verified->email ?? $request->input('email');
        $name = $request->input('name');

        $familyMember = User::familyMemberForAppleId($verified->id);

        $user = User::where('apple_id', $verified->id)->first();

        if (! $user && $email) {
            // Link Apple to a pre-existing account that shares the email.
            $user = User::where('email', $email)->first();
        }

        if (! $user && $familyMember) {
            // Attach to the family profile created ahead of their first login.
            $user = User::where('family_member', $familyMember)->first();
        }

        if ($user) {
            $user->apple_id = $verified->id;
            // Apple only returns the name/email on the first authorization, so only
            // fill them when we don't already have a value.
            $user->name = $user->name ?: ($name ?? 'Friend');
            $user->email = $user->email ?: $email;
            $user->family_member = $user->family_member ?? $familyMember;
            $user->save();
        } else {
            $user = User::create([
                'apple_id' => $verified->id,
                'name' => $name ?: 'Friend',
                'email' => $email,
                'password' => Hash::make(Str::random(40)),
                'family_member' => $familyMember,
            ]);
        }

        $device = $request->string('device')->toString() ?: 'apple';

        return response()->json([
            'token' => $user->createToken($device)->plainTextToken,
            'token_type' => 'Bearer',
            'user' => $user->only(['id', 'name', 'email', 'family_member']),
        ]);
    }
}
