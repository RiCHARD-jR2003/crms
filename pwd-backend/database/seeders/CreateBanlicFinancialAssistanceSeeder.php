<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Benefit;
use Carbon\Carbon;

class CreateBanlicFinancialAssistanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create Financial Assistance benefit for Banlic
        $benefit = Benefit::create([
            'title' => 'Financial Assistance - Banlic',
            'type' => 'Financial Assistance',
            'amount' => '250',
            'description' => 'Financial assistance benefit for residents of Banlic barangay. Amount: ₱250.00',
            'status' => 'Active',
            'selectedBarangays' => ['Banlic'],
            'barangay' => 'Banlic',
            'targetRecipients' => 'All PWD members in Banlic',
            'distributionDate' => Carbon::parse('2025-12-15')->startOfDay(),
            'expiryDate' => Carbon::parse('2025-12-15')->addMonths(3)->endOfDay(), // Expires 3 months after distribution
            'distributed' => 0,
            'pending' => 0,
            'color' => '#3498DB', // Blue color
            'submittedDate' => now(),
            'approvedDate' => now(),
        ]);

        $this->command->info('✅ Created Financial Assistance benefit for Banlic:');
        $this->command->info('   - ID: ' . $benefit->id);
        $this->command->info('   - Type: Financial Assistance');
        $this->command->info('   - Amount: ₱250.00');
        $this->command->info('   - Barangay: Banlic');
        $this->command->info('   - Distribution Date: December 15, 2025');
        $this->command->info('   - Status: Active');
    }
}


