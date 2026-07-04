<?php

use App\Http\Controllers\AppleAuthController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\BehaviorController;
use App\Http\Controllers\BehaviorIllustrationController;
use App\Http\Controllers\BehaviorLogController;
use App\Http\Controllers\ChoreController;
use App\Http\Controllers\ChoreLogController;
use App\Http\Controllers\ContactFormController;
use App\Http\Controllers\DraftArticleController;
use App\Http\Controllers\FamilyMoodController;
use App\Http\Controllers\LogoutController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PushTokenController;
use App\Http\Controllers\ResumeControler;
use App\Http\Controllers\RewardController;
use App\Http\Controllers\SlugHistoryController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\TempFileController;
use App\Http\Controllers\TestNotificationController;
use App\Http\Controllers\TypoFormController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Route::get('/status', StatusController::class)->name('status');

Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('/apple', AppleAuthController::class)->name('apple');
    Route::post('/logout', LogoutController::class)->middleware('auth:sanctum')->name('logout');
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
})->name('user');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/moods', [FamilyMoodController::class, 'index'])->name('moods.index');
    Route::patch('/moods/{member}', [FamilyMoodController::class, 'update'])->name('moods.update');

    Route::post('/push-tokens', [PushTokenController::class, 'store'])->name('push-tokens.store');
    Route::post('/notifications/test', TestNotificationController::class)->name('notifications.test');

    Route::get('/kids/{member}/behaviors', [BehaviorController::class, 'index'])->name('kids.behaviors.index');
    Route::post('/behaviors', [BehaviorController::class, 'store'])->name('behaviors.store');
    Route::patch('/behaviors/{behavior}', [BehaviorController::class, 'update'])->name('behaviors.update');
    Route::delete('/behaviors/{behavior}', [BehaviorController::class, 'destroy'])->name('behaviors.destroy');
    Route::post('/behaviors/{behavior}/logs', [BehaviorLogController::class, 'store'])->name('behaviors.logs.store');

    Route::get('/behavior-logs', [BehaviorLogController::class, 'index'])->name('behavior-logs.index');
    Route::delete('/behavior-logs/{behaviorLog}', [BehaviorLogController::class, 'destroy'])->name('behavior-logs.destroy');

    Route::get('/kids/{member}/chores', [ChoreController::class, 'index'])->name('kids.chores.index');
    Route::post('/chores', [ChoreController::class, 'store'])->name('chores.store');
    Route::patch('/chores/{chore}', [ChoreController::class, 'update'])->name('chores.update');
    Route::delete('/chores/{chore}', [ChoreController::class, 'destroy'])->name('chores.destroy');
    Route::post('/chores/{chore}/logs', [ChoreLogController::class, 'store'])->name('chores.logs.store');

    Route::get('/chore-logs', [ChoreLogController::class, 'index'])->name('chore-logs.index');
    Route::delete('/chore-logs/{choreLog}', [ChoreLogController::class, 'destroy'])->name('chore-logs.destroy');
    Route::post('/chore-logs/{choreLog}/review', [ChoreLogController::class, 'review'])->name('chore-logs.review');

    Route::get('/kids/{member}/rewards', [RewardController::class, 'index'])->name('kids.rewards.index');
    Route::post('/rewards', [RewardController::class, 'store'])->name('rewards.store');
    Route::patch('/rewards/{reward}', [RewardController::class, 'update'])->name('rewards.update');
    Route::delete('/rewards/{reward}', [RewardController::class, 'destroy'])->name('rewards.destroy');
    Route::post('/rewards/{reward}/redeem', [RewardController::class, 'redeem'])->name('rewards.redeem');

    Route::post('/behavior-illustrations', [BehaviorIllustrationController::class, 'store'])->name('behavior-illustrations.store');
    Route::get('/behavior-illustrations/{behaviorIllustration}', [BehaviorIllustrationController::class, 'show'])->name('behavior-illustrations.show');

    Route::post('/temp-files/presign', [TempFileController::class, 'presign'])->name('temp-files.presign');

    // The framework's /broadcasting/auth route is session-guarded; this one
    // authorizes the app's private channels with a Sanctum bearer token.
    Route::post('/broadcasting/auth', fn (Request $request) => Broadcast::auth($request))->name('broadcasting.auth');
});

Route::name('articles.')
    ->prefix('/articles')
    ->controller(ArticleController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{article:slug}', 'show')->name('show');
    });

if (config('site.secret_prefix')) {
    Route::name('draft_articles.')->prefix(config('site.secret_prefix'))->group(function () {
        Route::get('/articles/slugs', [DraftArticleController::class, 'slugs'])->name('slugs');
        Route::get('/articles/{article:slug}', [DraftArticleController::class, 'show'])->name('show');
    });
}

Route::get('/projects', ProjectController::class)->name('projects.index');
Route::get('/resume', ResumeControler::class)->name('resume');
Route::get('/resume/pdf', [ResumeControler::class, 'pdf'])->name('resume.pdf');
Route::post('/contact', ContactFormController::class)->name('contact');
Route::post('/typo', TypoFormController::class)->name('typo');
Route::get('/slug-history', SlugHistoryController::class)->name('slug-history.index');
