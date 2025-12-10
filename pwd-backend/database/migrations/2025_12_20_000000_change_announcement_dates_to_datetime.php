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
        // Use raw SQL to change DATE columns to DATETIME to preserve time component
        \DB::statement('ALTER TABLE `announcement` MODIFY `publishDate` DATETIME NOT NULL');
        \DB::statement('ALTER TABLE `announcement` MODIFY `expiryDate` DATETIME NULL');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revert back to DATE (will lose time component)
        \DB::statement('ALTER TABLE `announcement` MODIFY `publishDate` DATE NOT NULL');
        \DB::statement('ALTER TABLE `announcement` MODIFY `expiryDate` DATE NULL');
    }
};

