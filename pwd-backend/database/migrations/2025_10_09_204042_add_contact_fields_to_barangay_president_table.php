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
            $table->string('contact_number', 20)->nullable()->after('preferred_language');
            $table->string('email', 100)->nullable()->after('contact_number');
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
            $table->dropColumn(['contact_number', 'email']);
        });
    }
};
