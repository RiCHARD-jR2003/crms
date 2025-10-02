<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Added this import for DB facade

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // For SQLite compatibility, we'll use a different approach
        // SQLite doesn't support MODIFY COLUMN, so we'll just update the data
        // and let Laravel handle the column type through the model
        
        // Update existing 'Pending' status to 'Pending Barangay Approval'
        DB::statement("UPDATE application SET status = 'Pending Barangay Approval' WHERE status = 'Pending'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Update back to 'Pending'
        DB::statement("UPDATE application SET status = 'Pending' WHERE status IN ('Pending Barangay Approval', 'Pending Admin Approval')");
    }
};
