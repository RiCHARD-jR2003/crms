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
            $table->string('middleName', 50)->nullable()->after('lastName');
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
            $table->dropColumn('middleName');
        });
    }
};
