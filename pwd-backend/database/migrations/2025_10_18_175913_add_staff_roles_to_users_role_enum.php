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
        // Add Staff1, Staff2, and FrontDesk to the role enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'BarangayPresident', 'PWDMember', 'SuperAdmin', 'Staff1', 'Staff2', 'FrontDesk')");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove Staff1, Staff2, and FrontDesk from the role enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'BarangayPresident', 'PWDMember', 'SuperAdmin')");
    }
};
