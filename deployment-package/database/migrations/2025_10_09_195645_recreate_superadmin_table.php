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
        // Drop the existing superadmin table
        Schema::dropIfExists('superadmin');
        
        // Create the superadmin table with correct structure
        Schema::create('superadmin', function (Blueprint $table) {
            $table->unsignedBigInteger('userID')->primary();
            $table->timestamps();
            
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
        Schema::dropIfExists('superadmin');
    }
};