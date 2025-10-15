<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Announcement;
use Carbon\Carbon;

class AnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // This seeder is intentionally empty as announcements should be created
        // through the admin interface, not through seeding test data.
        
        $this->command->info('AnnouncementSeeder: No test announcements created.');
        $this->command->info('Announcements should be created through the admin interface.');
    }
}