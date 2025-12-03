<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add missed appointment and rescheduling fields
        Schema::table('disability_assessments', function (Blueprint $table) {
            // Track if appointment was missed
            if (!Schema::hasColumn('disability_assessments', 'is_missed')) {
                $table->boolean('is_missed')->default(false)->after('status');
            }
            if (!Schema::hasColumn('disability_assessments', 'missed_at')) {
                $table->timestamp('missed_at')->nullable()->after('is_missed');
            }
            if (!Schema::hasColumn('disability_assessments', 'missed_email_sent_at')) {
                $table->timestamp('missed_email_sent_at')->nullable()->after('missed_at');
            }
            
            // Rescheduling tracking
            if (!Schema::hasColumn('disability_assessments', 'reschedule_count')) {
                $table->integer('reschedule_count')->default(0)->after('missed_email_sent_at');
            }
            if (!Schema::hasColumn('disability_assessments', 'max_reschedule_allowed')) {
                $table->integer('max_reschedule_allowed')->default(1)->after('reschedule_count');
            }
            if (!Schema::hasColumn('disability_assessments', 'last_rescheduled_at')) {
                $table->timestamp('last_rescheduled_at')->nullable()->after('max_reschedule_allowed');
            }
            if (!Schema::hasColumn('disability_assessments', 'original_assessment_date')) {
                $table->date('original_assessment_date')->nullable()->after('last_rescheduled_at');
            }
            if (!Schema::hasColumn('disability_assessments', 'original_slot_number')) {
                $table->integer('original_slot_number')->nullable()->after('original_assessment_date');
            }
            
            // Unique reschedule token for email links
            if (!Schema::hasColumn('disability_assessments', 'reschedule_token')) {
                $table->string('reschedule_token', 64)->nullable()->unique()->after('original_slot_number');
            }
            if (!Schema::hasColumn('disability_assessments', 'reschedule_token_expires_at')) {
                $table->timestamp('reschedule_token_expires_at')->nullable()->after('reschedule_token');
            }
            
            // Attendance tracking
            if (!Schema::hasColumn('disability_assessments', 'attendance_status')) {
                $table->enum('attendance_status', [
                    'pending',      // Waiting for appointment date
                    'present',      // Applicant showed up
                    'absent',       // Applicant missed
                    'rescheduled'   // Appointment was rescheduled
                ])->default('pending')->after('reschedule_token_expires_at');
            }
            
            // Track who marked attendance
            if (!Schema::hasColumn('disability_assessments', 'attendance_marked_by')) {
                $table->unsignedBigInteger('attendance_marked_by')->nullable()->after('attendance_status');
            }
            if (!Schema::hasColumn('disability_assessments', 'attendance_marked_at')) {
                $table->timestamp('attendance_marked_at')->nullable()->after('attendance_marked_by');
            }
        });
        
        // Modify status enum to include 'missed' and 'rescheduled'
        // Using raw SQL to modify ENUM
        DB::statement("ALTER TABLE disability_assessments MODIFY COLUMN status ENUM(
            'pending',
            'scheduled',
            'completed',
            'finalized',
            'uploaded',
            'missed',
            'rescheduled',
            'cancelled'
        ) DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('disability_assessments', function (Blueprint $table) {
            $columns = [
                'is_missed', 'missed_at', 'missed_email_sent_at',
                'reschedule_count', 'max_reschedule_allowed', 'last_rescheduled_at',
                'original_assessment_date', 'original_slot_number',
                'reschedule_token', 'reschedule_token_expires_at',
                'attendance_status', 'attendance_marked_by', 'attendance_marked_at'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('disability_assessments', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
        
        // Revert status enum
        DB::statement("ALTER TABLE disability_assessments MODIFY COLUMN status ENUM(
            'pending', 'scheduled', 'completed', 'finalized', 'uploaded'
        ) DEFAULT 'pending'");
    }
};

