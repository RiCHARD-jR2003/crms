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
        Schema::create('email_verifications', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('verification_code', 6);
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);
            $table->string('purpose')->default('application_submission'); // application_submission, password_reset, etc.
            $table->timestamps();
            
            $table->index(['email', 'verification_code']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('email_verifications');
    }
};
