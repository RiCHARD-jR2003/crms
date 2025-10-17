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
        Schema::table('benefit', function (Blueprint $table) {
            $table->string('title')->nullable()->after('id');
            $table->string('type')->nullable()->after('title');
            $table->string('amount')->nullable()->after('type');
            $table->text('description')->nullable()->after('amount');
            $table->string('targetRecipients')->nullable()->after('description');
            $table->date('distributionDate')->nullable()->after('targetRecipients');
            $table->date('expiryDate')->nullable()->after('distributionDate');
            $table->string('barangay')->nullable()->after('expiryDate');
            $table->string('quarter')->nullable()->after('barangay');
            $table->string('birthdayMonth')->nullable()->after('quarter');
            $table->string('status')->default('Active')->after('birthdayMonth');
            $table->integer('distributed')->default(0)->after('status');
            $table->integer('pending')->default(0)->after('distributed');
            $table->string('color')->nullable()->after('pending');
            $table->timestamp('submittedDate')->nullable()->after('color');
            $table->string('approvalFile')->nullable()->after('submittedDate');
            $table->timestamp('approvedDate')->nullable()->after('approvalFile');
            $table->date('schedule')->nullable()->after('approvedDate');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('benefit', function (Blueprint $table) {
            $table->dropColumn([
                'title', 'type', 'amount', 'description', 'targetRecipients', 'distributionDate',
                'expiryDate', 'barangay', 'quarter', 'birthdayMonth', 'status',
                'distributed', 'pending', 'color', 'submittedDate', 'approvalFile', 'approvedDate'
            ]);
        });
    }
};
