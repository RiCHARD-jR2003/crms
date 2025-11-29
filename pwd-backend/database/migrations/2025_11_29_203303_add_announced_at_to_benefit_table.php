<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Use raw SQL to avoid Doctrine DBAL compatibility issues
        if (!Schema::hasColumn('benefit', 'announced_at')) {
            DB::statement('ALTER TABLE benefit ADD COLUMN announced_at TIMESTAMP NULL AFTER approvedDate');
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasColumn('benefit', 'announced_at')) {
            DB::statement('ALTER TABLE benefit DROP COLUMN announced_at');
        }
    }
};
