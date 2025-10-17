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
            $table->string('pwd_id', 20)->unique()->nullable()->after('userID');
            $table->timestamp('pwd_id_generated_at')->nullable()->after('pwd_id');
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
            $table->dropColumn(['pwd_id', 'pwd_id_generated_at']);
        });
    }
};
