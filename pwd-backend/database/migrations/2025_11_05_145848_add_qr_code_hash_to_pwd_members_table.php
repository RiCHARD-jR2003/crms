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
            $table->string('qr_code_hash', 64)->nullable()->unique()->after('cardExpirationDate');
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
            $table->dropColumn('qr_code_hash');
        });
    }
};
