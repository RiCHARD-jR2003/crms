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
        // Drop the existing foreign key constraint
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropForeign(['pwd_member_id']);
        });
        
        // Add the correct foreign key constraint
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->foreign('pwd_member_id')->references('id')->on('pwd_members')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the correct foreign key constraint
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropForeign(['pwd_member_id']);
        });
        
        // Add back the incorrect foreign key constraint (for rollback)
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->foreign('pwd_member_id')->references('id')->on('pwd_member')->onDelete('cascade');
        });
    }
};