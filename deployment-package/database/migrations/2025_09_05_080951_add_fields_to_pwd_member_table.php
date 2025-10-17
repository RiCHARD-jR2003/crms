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
        Schema::table('pwd_member', function (Blueprint $table) {
            $table->string('userID')->unique()->after('id');
            $table->string('firstName', 50)->after('userID');
            $table->string('lastName', 50)->after('firstName');
            $table->date('birthDate')->nullable()->after('lastName');
            $table->string('gender', 10)->nullable()->after('birthDate');
            $table->string('disabilityType', 100)->nullable()->after('gender');
            $table->text('address')->nullable()->after('disabilityType');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pwd_member', function (Blueprint $table) {
            $table->dropColumn(['userID', 'firstName', 'lastName', 'birthDate', 'gender', 'disabilityType', 'address']);
        });
    }
};