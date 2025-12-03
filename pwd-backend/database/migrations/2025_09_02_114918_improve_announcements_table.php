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
        Schema::table('announcement', function (Blueprint $table) {
            // Add category field if it doesn't exist (using type as category, but add explicit category for clarity)
            if (!Schema::hasColumn('announcement', 'category')) {
                $table->string('category', 50)->nullable()->after('type');
            }
            
            // Ensure publishDate can be used for sorting (already exists, but make sure it's indexed)
            // Add index for better sorting performance
            if (!$this->hasIndex('announcement', 'idx_publish_date')) {
                $table->index('publishDate', 'idx_publish_date');
            }
            if (!$this->hasIndex('announcement', 'idx_created_at')) {
                $table->index('created_at', 'idx_created_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('announcement', function (Blueprint $table) {
            if (Schema::hasColumn('announcement', 'category')) {
                $table->dropColumn('category');
            }
            // Note: We don't drop indexes in down() as they might have been added manually
        });
    }

    /**
     * Check if index exists
     */
    protected function hasIndex($table, $indexName)
    {
        $connection = Schema::getConnection();
        $databaseName = $connection->getDatabaseName();
        $indexes = $connection->select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$indexName]);
        return count($indexes) > 0;
    }
};

