<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ServeCommand extends Command
{
    protected $signature = 'serve:custom {--host=127.0.0.1} {--port=8000}';
    protected $description = 'Start the Laravel development server (Windows compatible)';

    public function handle()
    {
        $host = $this->option('host');
        $port = $this->option('port');
        
        $this->info("Starting Laravel development server...");
        $this->info("Server will be available at: http://{$host}:{$port}");
        $this->info("Press Ctrl+C to stop the server");
        
        // Use PHP's built-in server directly
        $command = "php -S {$host}:{$port} -t public";
        
        $this->info("Running: {$command}");
        
        $this->info("Due to Windows process limitations, please run this command manually:");
        $this->line("{$command}");
        $this->newLine();
        $this->info("Or use the batch file: start-server.bat");
    }
}
