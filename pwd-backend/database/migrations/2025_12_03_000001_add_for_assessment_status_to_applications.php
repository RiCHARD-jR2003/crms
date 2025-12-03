<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For MySQL, modify the status column to add 'For Assessment' and 'For Claiming'
        DB::statement("
            ALTER TABLE application 
            MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending Barangay Approval'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to revert - VARCHAR is more flexible than ENUM
    }
};

