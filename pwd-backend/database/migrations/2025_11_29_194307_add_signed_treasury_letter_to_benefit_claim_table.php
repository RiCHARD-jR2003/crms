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
        Schema::table('benefit_claim', function (Blueprint $table) {
            if (!Schema::hasColumn('benefit_claim', 'signedTreasuryLetter')) {
                $table->string('signedTreasuryLetter')->nullable()->after('authorizationLetter');
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
        Schema::table('benefit_claim', function (Blueprint $table) {
            if (Schema::hasColumn('benefit_claim', 'signedTreasuryLetter')) {
                $table->dropColumn('signedTreasuryLetter');
            }
        });
    }
};
