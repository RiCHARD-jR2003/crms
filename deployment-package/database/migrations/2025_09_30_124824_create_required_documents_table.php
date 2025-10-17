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
        Schema::create('required_documents', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_required')->default(true);
            $table->json('file_types')->nullable(); // ['pdf', 'jpg', 'png']
            $table->integer('max_file_size')->default(2048); // in KB
            $table->unsignedBigInteger('created_by');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->date('effective_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('userID')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('required_documents');
    }
};
