<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Enhanced ID Claim tracking with claimant info, scheduling, and multi-stage status
     */
    public function up(): void
    {
        Schema::create('id_claims', function (Blueprint $table) {
            $table->id();
            $table->string('member_id'); // PWD member userID
            $table->enum('claim_type', ['new', 'renewal'])->default('new');
            
            // Multi-stage status tracking
            $table->enum('status', [
                'pending',           // Awaiting processing
                'processing',        // Being processed by staff
                'ready_for_pickup',  // Card is ready, waiting for pickup
                'scheduled',         // Pickup appointment scheduled
                'claimed',           // Successfully claimed
                'cancelled'          // Cancelled
            ])->default('pending');
            
            // Claimant information
            $table->enum('claimant_type', ['Member', 'Guardian', 'Representative'])->nullable();
            $table->string('claimant_name')->nullable();
            $table->string('claimant_relationship')->nullable();
            $table->string('claimant_contact')->nullable();
            $table->string('claimant_id_type')->nullable(); // e.g., "Driver's License", "Passport"
            $table->string('claimant_id_number')->nullable();
            
            // Authorization letter (for representatives)
            $table->string('authorization_letter_path')->nullable();
            
            // Scheduling
            $table->date('scheduled_pickup_date')->nullable();
            $table->time('scheduled_pickup_time')->nullable();
            $table->text('scheduling_notes')->nullable();
            
            // Processing info
            $table->string('processed_by')->nullable(); // Staff userID who processed
            $table->timestamp('processed_at')->nullable();
            $table->string('released_by')->nullable(); // Staff userID who released the card
            $table->timestamp('released_at')->nullable();
            
            // Claim completion
            $table->timestamp('claimed_at')->nullable();
            $table->string('receipt_number')->nullable();
            $table->text('notes')->nullable();
            
            // Signature capture (base64 or file path)
            $table->text('claimant_signature')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('member_id');
            $table->index('status');
            $table->index('claim_type');
            $table->index('scheduled_pickup_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('id_claims');
    }
};

