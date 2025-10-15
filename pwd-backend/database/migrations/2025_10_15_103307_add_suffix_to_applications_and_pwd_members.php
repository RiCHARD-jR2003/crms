<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add suffix column to applications table
        Schema::table('application', function (Blueprint $table) {
            $table->string('suffix', 10)->nullable()->after('middleName');
        });

        // Add suffix column to pwd_members table
        Schema::table('pwd_members', function (Blueprint $table) {
            $table->string('suffix', 10)->nullable()->after('middleName');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove suffix column from applications table
        Schema::table('application', function (Blueprint $table) {
            $table->dropColumn('suffix');
        });

        // Remove suffix column from pwd_members table
        Schema::table('pwd_members', function (Blueprint $table) {
            $table->dropColumn('suffix');
        });
    }
};