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
     * 1. Update existing records to use created_at time if claimDate time is 00:00:00
     * 2. Change claimDate column from DATE to DATETIME
     *
     * @return void
     */
    public function up()
    {
        // Check if column exists and update existing records first
        if (Schema::hasColumn('benefit_claim', 'claimDate')) {
            // Update existing records that have time as 00:00:00 to use created_at time
            // This preserves the actual claim time for records that were created with datetime
            try {
                DB::statement("
                    UPDATE benefit_claim 
                    SET claimDate = CONCAT(DATE(claimDate), ' ', TIME(created_at))
                    WHERE claimDate IS NOT NULL 
                    AND TIME(claimDate) = '00:00:00'
                    AND created_at IS NOT NULL
                    AND claimDate != created_at
                ");
            } catch (\Exception $e) {
                // If the column is already DATETIME, the TIME() function might not work
                // Try alternative approach
                DB::statement("
                    UPDATE benefit_claim 
                    SET claimDate = created_at
                    WHERE claimDate IS NOT NULL 
                    AND DATE(claimDate) = DATE(created_at)
                    AND TIME(claimDate) = '00:00:00'
                    AND created_at IS NOT NULL
                ");
            }
        }

        // Change claimDate from date to datetime to store time information
        // Using raw SQL to avoid DBAL requirement
        try {
            DB::statement("ALTER TABLE benefit_claim MODIFY COLUMN claimDate DATETIME NULL");
        } catch (\Exception $e) {
            // Column might already be DATETIME, ignore error
            if (strpos($e->getMessage(), 'Duplicate column') === false && 
                strpos($e->getMessage(), 'already exists') === false) {
                throw $e;
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revert claimDate back to date type
        // Using raw SQL to avoid DBAL requirement
        try {
            DB::statement("ALTER TABLE benefit_claim MODIFY COLUMN claimDate DATE NULL");
        } catch (\Exception $e) {
            // Ignore if column doesn't exist or already is DATE
            if (strpos($e->getMessage(), 'Duplicate column') === false && 
                strpos($e->getMessage(), 'already exists') === false) {
                throw $e;
            }
        }
    }
};
