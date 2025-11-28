<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Application;
use App\Observers\ApplicationObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Register Application observer
        Application::observe(ApplicationObserver::class);
    }
}
