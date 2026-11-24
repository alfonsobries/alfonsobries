<?php

use App\Http\Controllers\AppSiteAssociationController;
use App\Http\Controllers\PublicBoxController;
use Illuminate\Support\Facades\Route;

Route::get('/.well-known/apple-app-site-association', AppSiteAssociationController::class)->name('apple-app-site-association');

Route::get('/b/{token}', PublicBoxController::class)
    ->where('token', '[a-z0-9]{12}')
    ->middleware('throttle:60,1')
    ->name('boxes.public');
