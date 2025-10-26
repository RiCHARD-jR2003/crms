<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        // Seed all user accounts and data
        $this->call([
            AdminAnnouncementSeeder::class,
            AdminSeeder::class,
            AnnouncementSeeder::class,
            BarangayPresidentSeeder::class,
            PWDMemberSeeder::class,
            PWDMembersFromApplicationsSeeder::class,
            RequiredDocumentSeeder::class,
            SuperAdminSeeder::class,
            Staff1Seeder::class,
            Staff2Seeder::class,
            FrontDeskSeeder::class
        ]);
    }
}
