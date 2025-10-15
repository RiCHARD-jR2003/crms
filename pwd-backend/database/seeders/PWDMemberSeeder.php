<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PWDMember;
use App\Models\Application;
use Illuminate\Support\Facades\Hash;

class PWDMemberSeeder extends Seeder
{
    public function run()
    {
        // This seeder is intentionally empty as PWD members should be created
        // through the application process, not through seeding test data.
        // Use PWDMembersFromApplicationsSeeder to migrate approved applications to PWD members.
        
        $this->command->info('PWDMemberSeeder: No test data created. PWD members should be created through applications.');
        $this->command->info('Use PWDMembersFromApplicationsSeeder to migrate approved applications to PWD members.');
    }
}
