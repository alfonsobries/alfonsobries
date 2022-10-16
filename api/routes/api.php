<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ContactFormController;
use App\Http\Controllers\DraftArticleController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ResumeControler;
use App\Http\Controllers\SlugHistoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{article:slug}', [ArticleController::class, 'show']);

if (config('site.secret_prefix')) {
    Route::prefix(config('site.secret_prefix'))->group(function () {
        Route::get('/articles', [DraftArticleController::class, 'index']);
        Route::get('/articles/{article:slug}', [DraftArticleController::class, 'show']);
    });
}

Route::get('/projects', ProjectController::class);
Route::get('/resume', ResumeControler::class);
Route::post('/contact', ContactFormController::class);
Route::get('/slug-history', SlugHistoryController::class)->name('slug-history.index');
