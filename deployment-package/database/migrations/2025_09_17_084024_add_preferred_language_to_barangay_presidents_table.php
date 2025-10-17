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
        Schema::table('barangay_president', function (Blueprint $table) {
            $table->string('preferred_language', 10)->default('en')->after('barangay');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('barangay_president', function (Blueprint $table) {
            $table->dropColumn('preferred_language');
        });
    }
};
