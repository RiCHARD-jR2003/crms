<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GoogleTranslateService;

class TestGoogleTranslate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:google-translate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Google Translate API integration';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Testing Google Translate API Integration');
        $this->info('=====================================');
        $this->newLine();

        try {
            $googleTranslate = new GoogleTranslateService();
            
            // Test 1: Single translation
            $this->info('Test 1: Single Translation');
            $this->info('-------------------------');
            $text = "Hello World";
            $translated = $googleTranslate->translate($text, 'tl', 'en');
            $this->line("Original: {$text}");
            $this->line("Translated: {$translated}");
            $this->newLine();
            
            // Test 2: Batch translation
            $this->info('Test 2: Batch Translation');
            $this->info('------------------------');
            $texts = ['Hello', 'World', 'Welcome'];
            $translated = $googleTranslate->translateBatch($texts, 'tl', 'en');
            $this->line("Original: " . implode(', ', $texts));
            $this->line("Translated: " . implode(', ', $translated));
            $this->newLine();
            
            // Test 3: Language detection
            $this->info('Test 3: Language Detection');
            $this->info('-------------------------');
            $detected = $googleTranslate->detectLanguage('Kumusta ka?');
            $this->line("Text: Kumusta ka?");
            $this->line("Detected Language: {$detected}");
            $this->newLine();
            
            // Test 4: Supported languages
            $this->info('Test 4: Supported Languages');
            $this->info('--------------------------');
            $languages = $googleTranslate->getSupportedLanguages();
            foreach ($languages as $code => $name) {
                $this->line("{$code}: {$name}");
            }
            
            $this->newLine();
            $this->info('✅ All tests completed successfully!');
            
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            $this->newLine();
            $this->line('Make sure you have:');
            $this->line('1. Set GOOGLE_TRANSLATE_API_KEY in your .env file');
            $this->line('2. Set GOOGLE_CLOUD_PROJECT_ID in your .env file');
            $this->line('3. Installed the Google Cloud Translate package');
            $this->line('4. Enabled the Cloud Translation API in Google Cloud Console');
        }

        return 0;
    }
}