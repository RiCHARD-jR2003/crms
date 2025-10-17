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
        Schema::table('support_ticket_messages', function (Blueprint $table) {
            $table->string('attachment_path')->nullable()->after('message');
            $table->string('attachment_name')->nullable()->after('attachment_path');
            $table->string('attachment_type')->nullable()->after('attachment_name');
            $table->integer('attachment_size')->nullable()->after('attachment_type');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('support_ticket_messages', function (Blueprint $table) {
            $table->dropColumn(['attachment_path', 'attachment_name', 'attachment_type', 'attachment_size']);
        });
    }
};
