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
        Schema::table('audit_log', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('audit_log', 'userID')) {
                $table->unsignedBigInteger('userID')->nullable();
                $table->index('userID');
            }
            if (!Schema::hasColumn('audit_log', 'action')) {
                $table->string('action', 255)->nullable();
            }
            if (!Schema::hasColumn('audit_log', 'timestamp')) {
                $table->timestamp('timestamp')->nullable()->useCurrent();
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
        Schema::table('audit_log', function (Blueprint $table) {
            if (Schema::hasColumn('audit_log', 'userID')) {
                $table->dropIndex(['userID']);
                $table->dropColumn('userID');
            }
            if (Schema::hasColumn('audit_log', 'action')) {
                $table->dropColumn('action');
            }
            if (Schema::hasColumn('audit_log', 'timestamp')) {
                $table->dropColumn('timestamp');
            }
        });
    }
};
