<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Benefit;
use Carbon\Carbon;

class CreateBanlicFinancialAssistance10000Seeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create Financial Assistance benefit for Banlic (₱10,000)
        $benefit = Benefit::create([
            'title' => 'Financial Assistance - Banlic (₱10,000)',
            'type' => 'Financial Assistance',
            'amount' => '10000',
            'description' => 'Financial assistance benefit for residents of Banlic barangay. Amount: ₱10,000.00. Distribution: December 15, 2025. Expires: December 16, 2025.',
            'status' => 'Active',
            'selectedBarangays' => ['Banlic'],
            'barangay' => 'Banlic',
            'targetRecipients' => 'All PWD members in Banlic',
            'distributionDate' => Carbon::parse('2025-12-15')->startOfDay(),
            'expiryDate' => Carbon::parse('2025-12-16')->endOfDay(), // Expires on December 16, 2025
            'distributed' => 0,
            'pending' => 0,
            'color' => '#E67E22', // Orange color to differentiate from other benefits
            'submittedDate' => now(),
            'approvedDate' => now(),
        ]);

        $this->command->info('✅ Created Financial Assistance benefit for Banlic (₱10,000):');
        $this->command->info('   - ID: ' . $benefit->id);
        $this->command->info('   - Type: Financial Assistance');
        $this->command->info('   - Amount: ₱10,000.00');
        $this->command->info('   - Barangay: Banlic');
        $this->command->info('   - Distribution Date: December 15, 2025');
        $this->command->info('   - Expiry Date: December 16, 2025');
        $this->command->info('   - Status: Active');
    }
}


