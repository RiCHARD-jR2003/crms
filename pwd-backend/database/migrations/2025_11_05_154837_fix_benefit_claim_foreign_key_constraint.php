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
        // Drop the old foreign key constraint if it exists
        try {
            $constraints = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'benefit_claim' 
                AND COLUMN_NAME = 'pwdID' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ");
            
            foreach ($constraints as $constraint) {
                DB::statement("ALTER TABLE benefit_claim DROP FOREIGN KEY {$constraint->CONSTRAINT_NAME}");
            }
        } catch (\Exception $e) {
            // Ignore if we can't find it
        }

        // Check if userID column exists and has an index in pwd_members
        $userIDIndex = DB::select("
            SELECT INDEX_NAME 
            FROM information_schema.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'pwd_members' 
            AND COLUMN_NAME = 'userID'
            AND INDEX_NAME != 'PRIMARY'
            LIMIT 1
        ");
        
        if (empty($userIDIndex)) {
            // Add index on userID if it doesn't exist (required for foreign key)
            DB::statement('ALTER TABLE pwd_members ADD INDEX idx_userid (userID)');
        }

        // Modify the column type to match userID (unsignedBigInteger)
        DB::statement('ALTER TABLE benefit_claim MODIFY COLUMN pwdID BIGINT UNSIGNED NULL');
        
        // Now add the foreign key constraint
        Schema::table('benefit_claim', function (Blueprint $table) {
            $table->foreign('pwdID')->references('userID')->on('pwd_members')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('benefit_claim', function (Blueprint $table) {
            // Drop the new foreign key
            try {
                $constraints = DB::select("
                    SELECT CONSTRAINT_NAME 
                    FROM information_schema.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'benefit_claim' 
                    AND COLUMN_NAME = 'pwdID' 
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                ");
                
                foreach ($constraints as $constraint) {
                    DB::statement("ALTER TABLE benefit_claim DROP FOREIGN KEY {$constraint->CONSTRAINT_NAME}");
                }
            } catch (\Exception $e) {
                // Ignore
            }
        });

        // Restore column type (back to string)
        DB::statement('ALTER TABLE benefit_claim MODIFY COLUMN pwdID VARCHAR(255) NULL');
    }
};
