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
        if (!Schema::hasTable('renewal_settings')) {
            Schema::create('renewal_settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value');
                $table->text('description')->nullable();
                $table->timestamps();
            });

            // Insert default settings
            DB::table('renewal_settings')->insert([
                [
                    'key' => 'renewal_days_before_expiry',
                    'value' => '30',
                    'description' => 'Number of days before card expiration to flag for renewal (default: 30 days)',
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'key' => 'renewal_reminder_interval_days',
                    'value' => '7',
                    'description' => 'Number of days between renewal reminder emails (default: 7 days)',
                    'created_at' => now(),
                    'updated_at' => now()
                ]
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
        Schema::dropIfExists('renewal_settings');
    }
};

