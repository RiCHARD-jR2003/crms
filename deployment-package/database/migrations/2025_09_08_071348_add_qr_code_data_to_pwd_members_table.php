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
        Schema::table('pwd_member', function (Blueprint $table) {
            $table->text('qr_code_data')->nullable()->after('pwd_id_generated_at');
            $table->timestamp('qr_code_generated_at')->nullable()->after('qr_code_data');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pwd_member', function (Blueprint $table) {
            $table->dropColumn(['qr_code_data', 'qr_code_generated_at']);
        });
    }
};
