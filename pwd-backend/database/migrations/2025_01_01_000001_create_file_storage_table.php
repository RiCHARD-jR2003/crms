<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('file_storage', function (Blueprint $table) {
            $table->id();
            $table->string('file_path')->unique();
            $table->string('file_name');
            $table->string('mime_type');
            $table->bigInteger('file_size'); // in bytes
            $table->longText('file_content')->nullable(); // BLOB for file content (stored as base64 or text)
            $table->string('storage_method')->default('database'); // database, base64, s3, local
            $table->timestamps();
            
            // Index for faster lookups
            $table->index('file_path');
            $table->index('storage_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_storage');
    }
};

