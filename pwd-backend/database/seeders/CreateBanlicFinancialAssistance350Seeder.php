<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Benefit;
use Carbon\Carbon;

class CreateBanlicFinancialAssistance350Seeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create Financial Assistance benefit for Banlic (₱350)
        $benefit = Benefit::create([
            'title' => 'Financial Assistance - Banlic (₱350)',
            'type' => 'Financial Assistance',
            'amount' => '350',
            'description' => 'Financial assistance benefit for residents of Banlic barangay. Amount: ₱350.00. Distribution: December 15, 2025. Expires: December 16, 2025.',
            'status' => 'Active',
            'selectedBarangays' => ['Banlic'],
            'barangay' => 'Banlic',
            'targetRecipients' => 'All PWD members in Banlic',
            'distributionDate' => Carbon::parse('2025-12-15')->startOfDay(),
            'expiryDate' => Carbon::parse('2025-12-16')->endOfDay(), // Expires on December 16, 2025
            'distributed' => 0,
            'pending' => 0,
            'color' => '#27AE60', // Green color to differentiate from the other benefit
            'submittedDate' => now(),
            'approvedDate' => now(),
        ]);

        $this->command->info('✅ Created Financial Assistance benefit for Banlic (₱350):');
        $this->command->info('   - ID: ' . $benefit->id);
        $this->command->info('   - Type: Financial Assistance');
        $this->command->info('   - Amount: ₱350.00');
        $this->command->info('   - Barangay: Banlic');
        $this->command->info('   - Distribution Date: December 15, 2025');
        $this->command->info('   - Expiry Date: December 16, 2025');
        $this->command->info('   - Status: Active');
    }
}



