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
        Schema::create('support_ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('support_ticket_id');
            $table->text('message');
            $table->enum('sender_type', ['pwd_member', 'admin']);
            $table->unsignedBigInteger('sender_id');
            $table->timestamps();

            $table->foreign('support_ticket_id')->references('id')->on('support_tickets')->onDelete('cascade');
            $table->index(['support_ticket_id', 'created_at']);
            $table->index(['sender_type', 'sender_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('support_ticket_messages');
    }
};
