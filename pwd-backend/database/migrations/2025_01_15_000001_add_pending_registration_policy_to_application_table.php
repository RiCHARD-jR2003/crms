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
        Schema::table('application', function (Blueprint $table) {
            // Add expiry timestamp
            $table->timestamp('expires_at')->nullable()->after('submissionDate');
            // Add reminder sent flag
            $table->boolean('reminder_sent')->default(false)->after('expires_at');
            // Update status enum to include Expired
            $table->string('status', 50)->change(); // Change from enum to string to allow Expired status
        });

        // Create pending registration policy settings table
        Schema::create('pending_registration_policy_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        \Illuminate\Support\Facades\DB::table('pending_registration_policy_settings')->insert([
            [
                'key' => 'holding_duration_hours',
                'value' => '72',
                'description' => 'Number of hours a pending application can remain pending (default: 72 hours / 3 days)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'expiry_action',
                'value' => 'expire',
                'description' => 'Action to take when holding duration expires: "expire" or "reject"',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'reminder_hours_before_expiry',
                'value' => '24',
                'description' => 'Send reminder email X hours before expiry (default: 24 hours)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'enable_pending_policy',
                'value' => 'true',
                'description' => 'Enable or disable the pending registration policy',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('application', function (Blueprint $table) {
            $table->dropColumn(['expires_at', 'reminder_sent']);
            // Note: We can't easily revert the status column change, but it's safe to leave it
        });

        Schema::dropIfExists('pending_registration_policy_settings');
    }
};

