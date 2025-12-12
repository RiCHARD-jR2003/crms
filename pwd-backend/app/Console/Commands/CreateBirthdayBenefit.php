<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Benefit;
use Carbon\Carbon;

class CreateBirthdayBenefit extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'benefit:create-birthday';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a birthday cash gift benefit for Niugan August birthdays';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $benefitData = [
            'title' => 'Birthday Cash Gift - Niugan August',
            'type' => 'Birthday Cash Gift',
            'amount' => '78000',
            'description' => 'Birthday Cash Gift for PWD members in Niugan with August birthdays. Distribution on December 13, 2025.',
            'barangay' => 'Niugan',
            'selectedBarangays' => ['Niugan'],
            'birthdayMonth' => 'August',
            'status' => 'Active',
            'distributionDate' => Carbon::parse('2025-12-13')->startOfDay(),
            'expiryDate' => Carbon::parse('2025-12-14')->endOfDay(),
            'distributed' => 0,
            'pending' => 0,
        ];

        $benefit = Benefit::create($benefitData);

        $this->info('Benefit created successfully!');
        $this->line('ID: ' . $benefit->id);
        $this->line('Title: ' . $benefit->title);
        $this->line('Amount: ₱' . number_format($benefit->amount, 2));
        $this->line('Barangay: ' . $benefit->barangay);
        $this->line('Birthday Month: ' . $benefit->birthdayMonth);
        $this->line('Distribution Date: ' . $benefit->distributionDate->format('M d, Y'));
        $this->line('Expiry Date: ' . $benefit->expiryDate->format('M d, Y'));

        return Command::SUCCESS;
    }
}
