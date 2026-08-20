<?php

use App\Models\Conversation;
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

// Live traffic on the private phone line (messages, calls, voicemails).
// The line is Alfonso's own number, so only he may listen.
Broadcast::channel('line', function ($user) {
    return $user->isAlfonso();
});

// Assistant replies stream here. Conversations are personal, so only the
// owner may subscribe.
Broadcast::channel('conversation.{id}', function ($user, $id) {
    return $user->isFamilyMember()
        && Conversation::whereKey($id)->where('user_id', $user->id)->exists();
});
