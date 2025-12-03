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
        Schema::table('announcement', function (Blueprint $table) {
            $table->unsignedBigInteger('benefitID')->nullable()->after('authorID');
            $table->index('benefitID');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('announcement', function (Blueprint $table) {
            $table->dropIndex(['benefitID']);
            $table->dropColumn('benefitID');
        });
    }
};

