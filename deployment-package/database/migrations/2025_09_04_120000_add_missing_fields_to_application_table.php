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
            // Personal Information fields
            $table->string('middleName', 50)->nullable()->after('lastName');
            $table->string('civilStatus', 20)->nullable()->after('gender');
            $table->string('nationality', 50)->nullable()->after('civilStatus');
            
            // Disability Details fields
            $table->string('disabilityCause', 100)->nullable()->after('disabilityType');
            $table->date('disabilityDate')->nullable()->after('disabilityCause');
            
            // Address Details fields
            $table->string('barangay', 100)->nullable()->after('address');
            $table->string('city', 100)->nullable()->after('barangay');
            $table->string('province', 100)->nullable()->after('city');
            $table->string('postalCode', 10)->nullable()->after('province');
            
            // Emergency Contact fields
            $table->string('emergencyContact', 100)->nullable()->after('contactNumber');
            $table->string('emergencyPhone', 20)->nullable()->after('emergencyContact');
            $table->string('emergencyRelationship', 50)->nullable()->after('emergencyPhone');
            
            // Additional Documents
            $table->string('idPicture')->nullable()->after('barangayClearance');
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
                'middleName',
                'civilStatus', 
                'nationality',
                'disabilityCause',
                'disabilityDate',
                'barangay',
                'city',
                'province',
                'postalCode',
                'emergencyContact',
                'emergencyPhone',
                'emergencyRelationship',
                'idPicture'
            ]);
        });
    }
};
