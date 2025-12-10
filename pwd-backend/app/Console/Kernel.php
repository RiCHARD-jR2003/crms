<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Check for cards expiring within 30 days and send notifications
        $schedule->command('pwd:check-card-renewals')
            ->daily()
            ->at('09:00'); // Run at 9:00 AM daily

        // Process pending applications for expiry/rejection
        $schedule->command('applications:process-pending')
            ->hourly(); // Run every hour

        // Auto-deactivate expired benefits (check every hour)
        $schedule->command('benefits:auto-deactivate')
            ->hourly(); // Run every hour to check for expired benefits

        // Check for IDs ready for claiming (14 business days after approval)
        $schedule->command('pwd:notify-id-ready')
            ->daily()
            ->at('10:00'); // Run at 10:00 AM daily
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
