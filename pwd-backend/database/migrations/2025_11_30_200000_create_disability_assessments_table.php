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
        // Create disability_assessments table
        Schema::create('disability_assessments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('application_id');
            $table->string('reference_number')->unique();
            
            // Scheduling
            $table->date('assessment_date');
            $table->time('assessment_time')->nullable();
            $table->integer('slot_number')->nullable(); // 1-10 for max 10 per day
            
            // Assessment Status
            $table->enum('status', [
                'pending',      // Initial state after barangay approval
                'scheduled',    // Appointment scheduled
                'completed',    // Assessment form filled
                'finalized',    // Staff finalized the form
                'uploaded'      // PDF uploaded for final approval
            ])->default('pending');
            
            // Applicant Information (auto-populated from application)
            $table->string('applicant_name');
            $table->string('applicant_email')->nullable();
            $table->string('applicant_contact')->nullable();
            
            // Disability Assessment Form Fields
            $table->string('disability_type')->nullable();
            $table->text('disability_description')->nullable();
            $table->string('disability_cause')->nullable();
            $table->date('disability_onset_date')->nullable();
            $table->enum('disability_severity', ['mild', 'moderate', 'severe', 'profound'])->nullable();
            
            // Functional Limitations
            $table->json('functional_limitations')->nullable(); // Array of limitations
            $table->text('mobility_status')->nullable();
            $table->text('communication_ability')->nullable();
            $table->text('self_care_ability')->nullable();
            $table->text('learning_ability')->nullable();
            
            // Medical Information
            $table->string('attending_physician')->nullable();
            $table->string('physician_license_no')->nullable();
            $table->string('medical_facility')->nullable();
            $table->text('medical_findings')->nullable();
            $table->text('recommendations')->nullable();
            
            // Assistive Devices
            $table->json('assistive_devices_needed')->nullable();
            $table->json('assistive_devices_current')->nullable();
            
            // Assessment Details
            $table->unsignedBigInteger('assessed_by')->nullable(); // Staff who conducted assessment
            $table->timestamp('assessed_at')->nullable();
            $table->unsignedBigInteger('finalized_by')->nullable(); // Staff who finalized
            $table->timestamp('finalized_at')->nullable();
            
            // PDF Storage
            $table->string('pdf_path')->nullable();
            $table->timestamp('pdf_generated_at')->nullable();
            
            // Additional Notes
            $table->text('assessor_notes')->nullable();
            $table->text('applicant_remarks')->nullable();
            
            // Email tracking
            $table->timestamp('scheduling_email_sent_at')->nullable();
            $table->timestamp('reminder_email_sent_at')->nullable();
            
            $table->timestamps();
            
            // Foreign key
            $table->foreign('application_id')
                  ->references('applicationID')
                  ->on('application')
                  ->onDelete('cascade');
                  
            $table->foreign('assessed_by')
                  ->references('userID')
                  ->on('users')
                  ->onDelete('set null');
                  
            $table->foreign('finalized_by')
                  ->references('userID')
                  ->on('users')
                  ->onDelete('set null');
        });
        
        // Add assessment status to application table
        Schema::table('application', function (Blueprint $table) {
            $table->enum('assessment_status', [
                'not_required',    // Not yet at assessment stage
                'pending',         // Waiting for scheduling
                'scheduled',       // Assessment scheduled
                'in_progress',     // Assessment being conducted
                'completed',       // Assessment completed
                'finalized',       // PDF generated
                'uploaded'         // PDF uploaded for final approval
            ])->default('not_required')->after('status');
            
            $table->string('assessment_pdf_path')->nullable()->after('assessment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('application', function (Blueprint $table) {
            $table->dropColumn(['assessment_status', 'assessment_pdf_path']);
        });
        
        Schema::dropIfExists('disability_assessments');
    }
};

