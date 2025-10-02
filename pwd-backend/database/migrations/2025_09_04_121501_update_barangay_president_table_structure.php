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
        // For SQLite compatibility, we need to recreate the table
        Schema::dropIfExists('barangay_president');
        
        Schema::create('barangay_president', function (Blueprint $table) {
            $table->unsignedBigInteger('userID')->primary();
            $table->string('barangayID', 50)->nullable();
            $table->timestamps();
            
            // Add foreign key constraint
            $table->foreign('userID')->references('userID')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('barangay_president');
        
        Schema::create('barangay_president', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }
};
