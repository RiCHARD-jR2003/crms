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
        Schema::create('pwd_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('userID');
            $table->string('firstName');
            $table->string('lastName');
            $table->string('middleName')->nullable();
            $table->date('birthDate');
            $table->enum('gender', ['Male', 'Female', 'Other']);
            $table->string('disabilityType');
            $table->text('address');
            $table->string('contactNumber')->nullable();
            $table->string('email')->nullable();
            $table->string('barangay');
            $table->string('emergencyContact')->nullable();
            $table->string('emergencyPhone')->nullable();
            $table->string('emergencyRelationship')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pwd_members');
    }
};
