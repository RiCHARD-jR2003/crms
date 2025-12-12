<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This will:
     * 1. Change claimDate column from DATE to DATETIME
     * 2. Update existing records to use created_at time if claimDate time is 00:00:00
     *
     * @return void
     */
    public function up()
    {
        // First, update existing records that have time as 00:00:00 to use created_at time
        // This preserves the actual claim time for records that were created with datetime
        DB::statement("
            UPDATE benefit_claim 
            SET claimDate = CONCAT(DATE(claimDate), ' ', TIME(created_at))
            WHERE claimDate IS NOT NULL 
            AND TIME(claimDate) = '00:00:00'
            AND created_at IS NOT NULL
        ");

        // Change claimDate from date to datetime to store time information
        Schema::table('benefit_claim', function (Blueprint $table) {
            $table->datetime('claimDate')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revert claimDate back to date type
        Schema::table('benefit_claim', function (Blueprint $table) {
            $table->date('claimDate')->nullable()->change();
        });
    }
};
