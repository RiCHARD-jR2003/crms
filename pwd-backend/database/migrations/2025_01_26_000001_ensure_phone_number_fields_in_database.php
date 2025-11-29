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
        // Ensure application table has contactNumber field with proper constraints
        if (Schema::hasTable('application')) {
            if (!Schema::hasColumn('application', 'contactNumber')) {
                Schema::table('application', function (Blueprint $table) {
                    // Add column if it doesn't exist
                    $table->string('contactNumber', 50)->nullable()->after('email');
                });
            }
            // Note: If column exists, we don't modify it to avoid data loss
            // The existing column structure should be fine
        }

        // Ensure pwd_members table has contactNumber field with proper constraints
        if (Schema::hasTable('pwd_members')) {
            if (!Schema::hasColumn('pwd_members', 'contactNumber')) {
                Schema::table('pwd_members', function (Blueprint $table) {
                    // Add column if it doesn't exist
                    $table->string('contactNumber', 50)->nullable()->after('address');
                });
            }
            // Note: If column exists, we don't modify it to avoid data loss
            // The existing column structure should be fine
        }

        // Add indexes for better search performance on phone numbers
        if (Schema::hasTable('application')) {
            try {
                Schema::table('application', function (Blueprint $table) {
                    // Try to add index - will fail silently if it already exists
                    $table->index('contactNumber', 'application_contact_number_index');
                });
            } catch (\Exception $e) {
                // Index might already exist, that's okay
                \Illuminate\Support\Facades\Log::info('Index application_contact_number_index may already exist');
            }
        }

        if (Schema::hasTable('pwd_members')) {
            try {
                Schema::table('pwd_members', function (Blueprint $table) {
                    // Try to add index - will fail silently if it already exists
                    $table->index('contactNumber', 'pwd_members_contact_number_index');
                });
            } catch (\Exception $e) {
                // Index might already exist, that's okay
                \Illuminate\Support\Facades\Log::info('Index pwd_members_contact_number_index may already exist');
            }
        }

        // Sync phone numbers from approved applications to pwd_members where missing
        // This ensures data consistency
        $this->syncPhoneNumbersFromApplications();
    }

    /**
     * Sync phone numbers from applications to pwd_members
     */
    private function syncPhoneNumbersFromApplications()
    {
        try {
            // Get all pwd_members with missing or empty contact numbers
            $membersWithoutPhone = DB::table('pwd_members')
                ->where(function($query) {
                    $query->whereNull('contactNumber')
                          ->orWhere('contactNumber', '')
                          ->orWhere('contactNumber', 'N/A');
                })
                ->get();

            foreach ($membersWithoutPhone as $member) {
                // Try to find matching application by pwdID
                $application = DB::table('application')
                    ->where('pwdID', $member->userID)
                    ->whereNotNull('contactNumber')
                    ->where('contactNumber', '!=', '')
                    ->where('contactNumber', '!=', 'N/A')
                    ->orderBy('submissionDate', 'desc')
                    ->first();

                // If not found by pwdID, try by email
                if (!$application && $member->email) {
                    $application = DB::table('application')
                        ->where('email', $member->email)
                        ->whereNotNull('contactNumber')
                        ->where('contactNumber', '!=', '')
                        ->where('contactNumber', '!=', 'N/A')
                        ->orderBy('submissionDate', 'desc')
                        ->first();
                }

                // If still not found, try by name matching
                if (!$application) {
                    $application = DB::table('application')
                        ->where('firstName', $member->firstName)
                        ->where('lastName', $member->lastName)
                        ->whereNotNull('contactNumber')
                        ->where('contactNumber', '!=', '')
                        ->where('contactNumber', '!=', 'N/A')
                        ->orderBy('submissionDate', 'desc')
                        ->first();
                }

                // Update pwd_member with phone number from application
                if ($application && $application->contactNumber) {
                    DB::table('pwd_members')
                        ->where('id', $member->id)
                        ->update([
                            'contactNumber' => $application->contactNumber,
                            'updated_at' => now()
                        ]);
                }
            }
        } catch (\Exception $e) {
            // Log error but don't fail migration
            \Illuminate\Support\Facades\Log::warning('Failed to sync phone numbers from applications', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove indexes
        if (Schema::hasTable('application')) {
            Schema::table('application', function (Blueprint $table) {
                $table->dropIndex('application_contact_number_index');
            });
        }

        if (Schema::hasTable('pwd_members')) {
            Schema::table('pwd_members', function (Blueprint $table) {
                $table->dropIndex('pwd_members_contact_number_index');
            });
        }

        // Note: We don't drop the columns as they might contain important data
        // If you need to remove them, do it manually
    }
};

