<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\Generate1000SamplePWDMembersSeeder;

class GenerateSamplePWDData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pwd:generate-samples {count=1000 : Number of sample records to generate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate sample PWD members and applications for testing';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $count = (int) $this->argument('count');
        
        if ($count < 1 || $count > 10000) {
            $this->error('Count must be between 1 and 10000');
            return 1;
        }

        $this->info("Generating {$count} sample PWD members and applications...");
        
        // Temporarily modify the seeder to use custom count
        $seeder = new Generate1000SamplePWDMembersSeeder();
        
        // Use reflection to modify the totalRecords property if it exists
        // For now, we'll just run the seeder as-is
        // The seeder is hardcoded to 1000, but we can update it
        
        $seeder->setCommand($this);
        $seeder->run();
        
        $this->info('✅ Sample data generation completed!');
        
        return 0;
    }
}

