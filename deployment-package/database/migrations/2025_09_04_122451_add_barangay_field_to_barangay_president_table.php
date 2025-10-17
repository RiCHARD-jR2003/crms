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
            // Add barangay field to specify which barangay they are president of
            $table->string('barangay', 100)->nullable()->after('barangayID');
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
            $table->dropColumn('barangay');
        });
    }
};
