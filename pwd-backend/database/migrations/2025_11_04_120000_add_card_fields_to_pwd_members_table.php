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
        Schema::table('pwd_members', function (Blueprint $table) {
            $table->boolean('cardClaimed')->default(false)->after('status');
            $table->date('cardIssueDate')->nullable()->after('cardClaimed');
            $table->date('cardExpirationDate')->nullable()->after('cardIssueDate');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pwd_members', function (Blueprint $table) {
            $table->dropColumn(['cardClaimed', 'cardIssueDate', 'cardExpirationDate']);
        });
    }
};

