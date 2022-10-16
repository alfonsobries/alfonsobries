<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

it('does not call the cache or makes any request if no cache key is set', function () {
    Cache::spy();
    Http::spy();

    $this->artisan('alfonsobries:deploy')->assertExitCode(0);

    Cache::shouldNotHaveBeenCalled();
    Http::shouldNotHaveBeenCalled();
});

it('makes a request if the expired cache key is set', function () {
    Cache::spy();

    Config::set('services.vercel.deployment_url', 'https://vercel.com');

    Http::shouldReceive('post')->once()->with(Config::get('services.vercel.deployment_url'));

    Cache::shouldReceive('has')
        ->with(Config::get('site.expireCacheKey'))
        ->andReturn(true);

    $this->artisan('alfonsobries:deploy')->assertExitCode(0);

    Cache::shouldHaveReceived('forget')->once()->with(Config::get('site.expireCacheKey'));
});

it('makes a request if the the force option is passed even if cache key wasnt set', function () {
    Cache::spy();

    Config::set('services.vercel.deployment_url', 'https://vercel.com');

    Http::shouldReceive('post')->once()->with(Config::get('services.vercel.deployment_url'));

    Cache::shouldReceive('has')
        ->with(Config::get('site.expireCacheKey'))
        // Not passed
        ->andReturn(false);

    $this->artisan('alfonsobries:deploy --force')->assertExitCode(0);

    Cache::shouldHaveReceived('forget')->once()->with(Config::get('site.expireCacheKey'));
});
