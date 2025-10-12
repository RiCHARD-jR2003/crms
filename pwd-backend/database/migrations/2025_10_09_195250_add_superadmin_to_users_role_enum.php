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
        // Add SuperAdmin to the role enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'BarangayPresident', 'PWDMember', 'SuperAdmin')");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove SuperAdmin from the role enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'BarangayPresident', 'PWDMember')");
    }
};