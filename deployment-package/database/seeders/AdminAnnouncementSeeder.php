<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Announcement;
use App\Models\User;

class AdminAnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // This seeder is intentionally empty as announcements should be created
        // through the admin interface, not through seeding test data.
        
        $this->command->info('AdminAnnouncementSeeder: No test announcements created.');
        $this->command->info('Announcements should be created through the admin interface.');
    }
}
