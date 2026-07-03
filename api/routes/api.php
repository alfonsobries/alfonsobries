<?php

use App\Http\Controllers\AppleAuthController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ContactFormController;
use App\Http\Controllers\DraftArticleController;
use App\Http\Controllers\FamilyMoodController;
use App\Http\Controllers\LogoutController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ResumeControler;
use App\Http\Controllers\SlugHistoryController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\TypoFormController;
use Illuminate\Http\Request;
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
