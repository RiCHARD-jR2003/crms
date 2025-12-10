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
            $table->date('approval_date')->nullable()->after('pwd_id_generated_at');
            $table->timestamp('id_ready_notification_sent_at')->nullable()->after('approval_date');
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
            $table->dropColumn(['approval_date', 'id_ready_notification_sent_at']);
        });
    }
};
