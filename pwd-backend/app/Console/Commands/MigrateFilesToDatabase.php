<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Services\FileStorageService;
use App\Models\Application;

class MigrateFilesToDatabase extends Command
{
    protected $signature = 'migrate:files-to-database 
                            {--dry-run : Show what would be migrated without actually migrating}';

    protected $description = 'Migrate files from local storage to database storage';

    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->info('DRY RUN MODE - No files will be migrated');
        }

        $this->info('Starting file migration to database...');
        
        // Get all applications with file paths
        $applications = Application::all();
        $migrated = 0;
        $failed = 0;

        foreach ($applications as $application) {
            $fileFields = [
                'medicalCertificate',
                'barangayCertificate',
                'clinicalAbstract',
                'voterCertificate',
                'birthCertificate',
                'wholeBodyPicture',
                'affidavit',
                'idPictures'
            ];

            foreach ($fileFields as $field) {
                $filePath = $application->$field;
                
                if (!$filePath) {
                    continue;
                }

                // Handle idPictures (JSON array)
                if ($field === 'idPictures' && is_string($filePath)) {
                    $idPictures = json_decode($filePath, true);
                    if (is_array($idPictures)) {
                        foreach ($idPictures as $idPicture) {
                            if ($this->migrateFile($idPicture, $dryRun)) {
                                $migrated++;
                            } else {
                                $failed++;
                            }
                        }
                    }
                    continue;
                }

                if ($this->migrateFile($filePath, $dryRun)) {
                    $migrated++;
                } else {
                    $failed++;
                }
            }
        }

        $this->info("Migration complete!");
        $this->info("Migrated: {$migrated} files");
        $this->info("Failed: {$failed} files");
        
        if (!$dryRun) {
            $this->info("\nDon't forget to set FILE_STORAGE_METHOD=database in your .env file");
        }
    }

    private function migrateFile($filePath, $dryRun)
    {
        try {
            $fullPath = storage_path('app/public/' . $filePath);
            
            if (!file_exists($fullPath)) {
                $this->warn("File not found: {$filePath}");
                return false;
            }

            // Check if already in database
            if (DB::table('file_storage')->where('file_path', $filePath)->exists()) {
                $this->line("Already migrated: {$filePath}");
                return true;
            }

            if ($dryRun) {
                $this->line("Would migrate: {$filePath}");
                return true;
            }

            // Read file content
            $fileContent = file_get_contents($fullPath);
            $mimeType = mime_content_type($fullPath);
            $fileSize = filesize($fullPath);

            // Store in database
            DB::table('file_storage')->insert([
                'file_path' => $filePath,
                'file_name' => basename($filePath),
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'file_content' => $fileContent,
                'storage_method' => 'database',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->info("Migrated: {$filePath}");
            return true;
        } catch (\Exception $e) {
            $this->error("Error migrating {$filePath}: " . $e->getMessage());
            return false;
        }
    }
}

