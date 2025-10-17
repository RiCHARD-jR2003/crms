<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Update existing Admin and BarangayPresident users to not require password change
        DB::table('users')
            ->whereIn('role', ['Admin', 'BarangayPresident', 'SuperAdmin'])
            ->update(['password_change_required' => false]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revert Admin and BarangayPresident users to require password change
        DB::table('users')
            ->whereIn('role', ['Admin', 'BarangayPresident', 'SuperAdmin'])
            ->update(['password_change_required' => true]);
    }
};