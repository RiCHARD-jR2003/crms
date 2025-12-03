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
        // Make assessment_date nullable to allow creating pending assessments without a scheduled date
        DB::statement('ALTER TABLE disability_assessments MODIFY COLUMN assessment_date DATE NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to non-nullable (only if all records have a date)
        DB::statement('ALTER TABLE disability_assessments MODIFY COLUMN assessment_date DATE NOT NULL');
    }
};

