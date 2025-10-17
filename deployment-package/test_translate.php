<?php

require_once 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Services\GoogleTranslateService;

echo "Testing Google Translate API Integration\n";
echo "=====================================\n\n";

try {
    $googleTranslate = new GoogleTranslateService();
    
    // Test 1: Single translation
    echo "Test 1: Single Translation\n";
    echo "-------------------------\n";
    $text = "Hello World";
    $translated = $googleTranslate->translate($text, 'tl', 'en');
    echo "Original: {$text}\n";
    echo "Translated: {$translated}\n\n";
    
    // Test 2: Batch translation
    echo "Test 2: Batch Translation\n";
    echo "------------------------\n";
    $texts = ['Hello', 'World', 'Welcome'];
    $translated = $googleTranslate->translateBatch($texts, 'tl', 'en');
    echo "Original: " . implode(', ', $texts) . "\n";
    echo "Translated: " . implode(', ', $translated) . "\n\n";
    
    // Test 3: Language detection
    echo "Test 3: Language Detection\n";
    echo "-------------------------\n";
    $detected = $googleTranslate->detectLanguage('Kumusta ka?');
    echo "Text: Kumusta ka?\n";
    echo "Detected Language: {$detected}\n\n";
    
    // Test 4: Supported languages
    echo "Test 4: Supported Languages\n";
    echo "--------------------------\n";
    $languages = $googleTranslate->getSupportedLanguages();
    foreach ($languages as $code => $name) {
        echo "{$code}: {$name}\n";
    }
    
    echo "\n✅ All tests completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "\nMake sure you have:\n";
    echo "1. Set GOOGLE_TRANSLATE_API_KEY in your .env file\n";
    echo "2. Installed the Google Cloud Translate package\n";
    echo "3. Enabled the Cloud Translation API in Google Cloud Console\n";
}
