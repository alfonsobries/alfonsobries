<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// The app listens here while an AI behavior illustration generates; any
// family member may subscribe (the device already gates with Face ID).
Broadcast::channel('behavior-illustration.{id}', function ($user, $id) {
    return $user->isFamilyMember();
});
