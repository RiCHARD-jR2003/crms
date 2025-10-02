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
        Schema::table('pwd_members', function (Blueprint $table) {
            $table->string('pwd_id', 20)->unique()->nullable()->after('userID');
            $table->timestamp('pwd_id_generated_at')->nullable()->after('pwd_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pwd_members', function (Blueprint $table) {
            $table->dropColumn(['pwd_id', 'pwd_id_generated_at']);
        });
    }
};