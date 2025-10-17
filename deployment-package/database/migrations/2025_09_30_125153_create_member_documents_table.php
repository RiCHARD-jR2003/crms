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
        Schema::create('member_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('member_id');
            $table->unsignedBigInteger('required_document_id');
            $table->string('file_path');
            $table->string('file_name');
            $table->integer('file_size'); // in bytes
            $table->string('file_type');
            $table->timestamp('uploaded_at');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->foreign('member_id')->references('userID')->on('users');
            $table->foreign('required_document_id')->references('id')->on('required_documents');
            $table->foreign('reviewed_by')->references('userID')->on('users');
            
            $table->unique(['member_id', 'required_document_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('member_documents');
    }
};
