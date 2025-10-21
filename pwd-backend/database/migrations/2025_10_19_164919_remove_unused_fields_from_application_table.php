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
        Schema::table('application', function (Blueprint $table) {
            // Remove unused fields that are no longer needed
            $table->dropColumn([
                'barangayClearance',
                'idPicture'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('application', function (Blueprint $table) {
            // Re-add the fields if migration needs to be rolled back
            $table->string('barangayClearance')->nullable()->after('medicalCertificate');
            $table->string('idPicture')->nullable()->after('barangayClearance');
        });
    }
};
