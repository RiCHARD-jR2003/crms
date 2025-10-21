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
        Schema::create('document_correction_requests', function (Blueprint $table) {
            $table->id();
            $table->string('application_id_string'); // Store the original applicationID string
            $table->json('documents_to_correct'); // Array of document types that need correction
            $table->text('notes')->nullable(); // Additional notes from staff
            $table->string('requested_by'); // User ID who requested the correction
            $table->string('requested_by_name'); // Name of the person who requested correction
            $table->enum('status', ['pending', 'completed', 'expired'])->default('pending');
            $table->string('correction_token', 32)->unique(); // Secure token for applicant access
            $table->timestamp('expires_at'); // Token expiration date
            $table->timestamp('completed_at')->nullable(); // When correction was completed
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['status', 'expires_at']);
            $table->index('correction_token');
            $table->index('application_id_string');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('document_correction_requests');
    }
};
