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
        // Remove unique constraint on email column
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']);
        });
        
        // Add index instead (allows duplicates but still fast lookups)
        Schema::table('users', function (Blueprint $table) {
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove index
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email']);
        });
        
        // Re-add unique constraint
        Schema::table('users', function (Blueprint $table) {
            $table->unique('email');
        });
    }
};

