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
            // Add new document fields for comprehensive PWD application requirements
            $table->string('clinicalAbstract')->nullable()->after('medicalCertificate');
            $table->string('voterCertificate')->nullable()->after('clinicalAbstract');
            $table->string('idPictures')->nullable()->after('voterCertificate'); // JSON field for multiple ID pictures
            $table->string('birthCertificate')->nullable()->after('idPictures');
            $table->string('wholeBodyPicture')->nullable()->after('birthCertificate');
            $table->string('affidavit')->nullable()->after('wholeBodyPicture');
            $table->string('barangayCertificate')->nullable()->after('affidavit');
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
            $table->dropColumn([
                'clinicalAbstract',
                'voterCertificate',
                'idPictures',
                'birthCertificate',
                'wholeBodyPicture',
                'affidavit',
                'barangayCertificate'
            ]);
        });
    }
};
