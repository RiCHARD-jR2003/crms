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
        Schema::table('pwd_members', function (Blueprint $table) {
            // Add renewal flagging fields
            if (!Schema::hasColumn('pwd_members', 'renewal_flag')) {
                $table->boolean('renewal_flag')->default(false);
            }
            if (!Schema::hasColumn('pwd_members', 'flagged_at')) {
                $table->timestamp('flagged_at')->nullable();
            }
            if (!Schema::hasColumn('pwd_members', 'renewal_reminder_sent_at')) {
                $table->timestamp('renewal_reminder_sent_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pwd_members', function (Blueprint $table) {
            $table->dropIndex(['renewal_flag', 'cardExpirationDate']);
            if (Schema::hasColumn('pwd_members', 'renewal_reminder_sent_at')) {
                $table->dropColumn('renewal_reminder_sent_at');
            }
            if (Schema::hasColumn('pwd_members', 'flagged_at')) {
                $table->dropColumn('flagged_at');
            }
            if (Schema::hasColumn('pwd_members', 'renewal_flag')) {
                $table->dropColumn('renewal_flag');
            }
        });
    }
};

