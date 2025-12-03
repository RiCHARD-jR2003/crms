<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('benefit', function (Blueprint $table) {
            // Index for status filtering (most common query)
            $table->index('status', 'idx_benefit_status');
            
            // Index for barangay filtering
            $table->index('barangay', 'idx_benefit_barangay');
            
            // Composite index for status + barangay (common combination)
            $table->index(['status', 'barangay'], 'idx_benefit_status_barangay');
            
            // Index for date-based sorting and filtering
            $table->index('created_at', 'idx_benefit_created_at');
            $table->index('distributionDate', 'idx_benefit_distribution_date');
            $table->index('expiryDate', 'idx_benefit_expiry_date');
            
            // Composite index for active benefits sorted by date
            $table->index(['status', 'created_at'], 'idx_benefit_status_created');
            $table->index(['status', 'distributionDate'], 'idx_benefit_status_distribution');
            
            // Index for type filtering
            $table->index('type', 'idx_benefit_type');
        });

        Schema::table('benefit_claim', function (Blueprint $table) {
            // Index for pwdID (most common filter)
            $table->index('pwdID', 'idx_benefit_claim_pwd_id');
            
            // Index for benefitID
            $table->index('benefitID', 'idx_benefit_claim_benefit_id');
            
            // Index for status filtering
            $table->index('status', 'idx_benefit_claim_status');
            
            // Composite index for duplicate prevention (pwdID + benefitID + status)
            $table->index(['pwdID', 'benefitID', 'status'], 'idx_benefit_claim_duplicate_check');
            
            // Index for date-based queries
            $table->index('claimDate', 'idx_benefit_claim_date');
            $table->index('created_at', 'idx_benefit_claim_created_at');
            
            // Composite index for user's claims with status
            $table->index(['pwdID', 'status'], 'idx_benefit_claim_user_status');
        });

        // Index for pwd_members table (used in benefit queries)
        if (Schema::hasTable('pwd_members')) {
            Schema::table('pwd_members', function (Blueprint $table) {
                // Index for barangay filtering
                if (!Schema::hasColumn('pwd_members', 'barangay')) {
                    return; // Column doesn't exist, skip
                }
                $table->index('barangay', 'idx_pwd_members_barangay');
                $table->index('status', 'idx_pwd_members_status');
                $table->index(['barangay', 'status'], 'idx_pwd_members_barangay_status');
                $table->index('userID', 'idx_pwd_members_user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('benefit', function (Blueprint $table) {
            $table->dropIndex('idx_benefit_status');
            $table->dropIndex('idx_benefit_barangay');
            $table->dropIndex('idx_benefit_status_barangay');
            $table->dropIndex('idx_benefit_created_at');
            $table->dropIndex('idx_benefit_distribution_date');
            $table->dropIndex('idx_benefit_expiry_date');
            $table->dropIndex('idx_benefit_status_created');
            $table->dropIndex('idx_benefit_status_distribution');
            $table->dropIndex('idx_benefit_type');
        });

        Schema::table('benefit_claim', function (Blueprint $table) {
            $table->dropIndex('idx_benefit_claim_pwd_id');
            $table->dropIndex('idx_benefit_claim_benefit_id');
            $table->dropIndex('idx_benefit_claim_status');
            $table->dropIndex('idx_benefit_claim_duplicate_check');
            $table->dropIndex('idx_benefit_claim_date');
            $table->dropIndex('idx_benefit_claim_created_at');
            $table->dropIndex('idx_benefit_claim_user_status');
        });

        if (Schema::hasTable('pwd_members')) {
            Schema::table('pwd_members', function (Blueprint $table) {
                try {
                    $table->dropIndex('idx_pwd_members_barangay');
                    $table->dropIndex('idx_pwd_members_status');
                    $table->dropIndex('idx_pwd_members_barangay_status');
                    $table->dropIndex('idx_pwd_members_user_id');
                } catch (\Exception $e) {
                    // Indexes might not exist, ignore
                }
            });
        }
    }
};

