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
            $table->string('pwdID')->nullable();
            $table->unsignedBigInteger('benefitID')->nullable();
            $table->date('claimDate')->nullable();
            $table->string('status')->default('unclaimed');
            
            // Add foreign key constraints
            $table->foreign('pwdID')->references('userID')->on('pwd_member')->onDelete('cascade');
            $table->foreign('benefitID')->references('id')->on('benefit')->onDelete('cascade');
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
            $table->dropForeign(['pwdID']);
            $table->dropForeign(['benefitID']);
            $table->dropColumn(['pwdID', 'benefitID', 'claimDate', 'status']);
        });
    }
};
