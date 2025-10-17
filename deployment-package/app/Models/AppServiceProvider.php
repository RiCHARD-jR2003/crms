<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // Map polymorphic relationships
        Relation::morphMap([
            'admin' => 'App\Models\Admin',
            'barangay_president' => 'App\Models\BarangayPresident',
            'pwd_member' => 'App\Models\PWDMember',
        ]);
    }
}