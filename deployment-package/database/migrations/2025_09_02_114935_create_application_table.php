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
        Schema::create('application', function (Blueprint $table) {
            $table->id('applicationID');
            $table->unsignedBigInteger('pwdID')->nullable();
            $table->string('firstName', 50);
            $table->string('lastName', 50);
            $table->date('birthDate');
            $table->string('gender', 10);
            $table->string('disabilityType', 100);
            $table->text('address');
            $table->string('email')->unique();
            $table->string('contactNumber', 20);
            $table->string('idType', 50);
            $table->string('idNumber', 50);
            $table->string('medicalCertificate')->nullable();
            $table->string('barangayClearance')->nullable();
            $table->date('submissionDate');
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            $table->foreign('pwdID')->references('userID')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('application');
    }
};
