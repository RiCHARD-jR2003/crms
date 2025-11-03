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
        Schema::create('security_events', function (Blueprint $table) {
            $table->bigIncrements('eventID');
            $table->string('event_type', 100); // SQL_INJECTION, XSS, PATH_TRAVERSAL, COMMAND_INJECTION, BRUTE_FORCE, UNAUTHORIZED_ACCESS, SUSPICIOUS_PATTERN, CSRF_FAILURE, FILE_UPLOAD_THREAT
            $table->string('severity', 20)->default('medium'); // low, medium, high, critical
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->unsignedBigInteger('userID')->nullable();
            $table->string('url', 500);
            $table->string('method', 10); // GET, POST, PUT, DELETE, etc.
            $table->text('request_data')->nullable(); // JSON encoded request data
            $table->text('description')->nullable();
            $table->text('detected_pattern')->nullable(); // What pattern was detected
            $table->string('status', 20)->default('pending'); // pending, investigated, resolved, false_positive
            $table->timestamp('detected_at')->useCurrent();
            $table->timestamps();

            $table->index('event_type');
            $table->index('severity');
            $table->index('status');
            $table->index('detected_at');
            $table->index('ip_address');
            $table->index('userID');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('security_events');
    }
};
