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
        // For MySQL, modify the enum column directly
        DB::statement("
            ALTER TABLE application 
            MODIFY COLUMN status ENUM(
                'Pending Barangay Approval', 
                'Pending Admin Approval', 
                'Approved', 
                'Rejected',
                'Under Review',
                'Needs Additional Documents',
                'Pending'
            ) DEFAULT 'Pending Barangay Approval'
        ");
        
        // Add dynamicDocuments column if it doesn't exist
        if (!Schema::hasColumn('application', 'dynamicDocuments')) {
            Schema::table('application', function (Blueprint $table) {
                $table->text('dynamicDocuments')->nullable()->after('remarks');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original enum values
        DB::statement("
            ALTER TABLE application 
            MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending'
        ");
        
        // Remove dynamicDocuments column
        if (Schema::hasColumn('application', 'dynamicDocuments')) {
            Schema::table('application', function (Blueprint $table) {
                $table->dropColumn('dynamicDocuments');
            });
        }
    }
};