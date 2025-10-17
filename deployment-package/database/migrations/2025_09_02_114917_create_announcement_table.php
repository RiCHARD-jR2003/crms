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
        Schema::create('announcement', function (Blueprint $table) {
            $table->id('announcementID');
            $table->unsignedBigInteger('authorID')->default(1);
            $table->string('title', 100);
            $table->text('content');
            $table->string('type', 50)->default('Information');
            $table->string('priority', 20)->default('Medium');
            $table->string('targetAudience', 100);
            $table->string('status', 20)->default('Active');
            $table->date('publishDate');
            $table->date('expiryDate');
            $table->integer('views')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('announcement');
    }
};
