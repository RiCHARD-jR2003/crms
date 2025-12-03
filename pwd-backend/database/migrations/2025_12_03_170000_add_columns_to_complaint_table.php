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
        Schema::table('complaint', function (Blueprint $table) {
            if (!Schema::hasColumn('complaint', 'complaintID')) {
                // Use id as primary key instead, it's already there
            }
            if (!Schema::hasColumn('complaint', 'pwdID')) {
                $table->unsignedBigInteger('pwdID')->nullable()->after('id');
            }
            if (!Schema::hasColumn('complaint', 'subject')) {
                $table->string('subject', 255)->nullable()->after('pwdID');
            }
            if (!Schema::hasColumn('complaint', 'description')) {
                $table->text('description')->nullable()->after('subject');
            }
            if (!Schema::hasColumn('complaint', 'status')) {
                $table->string('status', 50)->default('Pending')->after('description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaint', function (Blueprint $table) {
            $columns = ['pwdID', 'subject', 'description', 'status'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('complaint', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

