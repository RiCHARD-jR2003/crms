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
        // For MySQL/MariaDB, we can use ALTER TABLE to modify the column
        DB::statement('ALTER TABLE support_ticket_messages MODIFY COLUMN message TEXT NULL');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('ALTER TABLE support_ticket_messages MODIFY COLUMN message TEXT NOT NULL');
    }
};