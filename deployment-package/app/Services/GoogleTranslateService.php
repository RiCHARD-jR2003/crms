<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleTranslateService
{
    private $apiKey;
    private $projectId;
    
    public function __construct()
    {
        $this->apiKey = config('google_translate.api_key');
        $this->projectId = config('google_translate.project_id', 'your-project-id');
        
        if (!$this->apiKey) {
            Log::error('Google Translate API Key is not set.');
            throw new \Exception('Google Translate API Key is not set.');
        }
    }
    
    /**
     * Translate text to target language using Google Translate API
     *
     * @param string $text
     * @param string $targetLanguage
     * @param string $sourceLanguage
     * @return string
     */
    public function translate(string $text, string $targetLanguage, string $sourceLanguage = 'en'): string
    {
        try {
            // Map our language codes to Google's codes
            $googleTargetLanguage = $this->mapLanguageCode($targetLanguage);
            $googleSourceLanguage = $this->mapLanguageCode($sourceLanguage);
            
            $response = Http::post('https://translation.googleapis.com/language/translate/v2', [
                'key' => $this->apiKey,
                'q' => $text,
                'target' => $googleTargetLanguage,
                'source' => $googleSourceLanguage,
                'format' => 'text'
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['data']['translations'][0]['translatedText'])) {
                    return $data['data']['translations'][0]['translatedText'];
                }
            }
            
            Log::error('Translation API response: ' . $response->body());
            return $text; // Return original text on error
            
        } catch (\Exception $e) {
            Log::error('Translation failed: ' . $e->getMessage());
            return $text; // Return original text on error
        }
    }
    
    /**
     * Translate multiple texts at once
     *
     * @param array $texts
     * @param string $targetLanguage
     * @param string $sourceLanguage
     * @return array
     */
    public function translateBatch(array $texts, string $targetLanguage, string $sourceLanguage = 'en'): array
    {
        try {
            // Map our language codes to Google's codes
            $googleTargetLanguage = $this->mapLanguageCode($targetLanguage);
            $googleSourceLanguage = $this->mapLanguageCode($sourceLanguage);
            
            $response = Http::post('https://translation.googleapis.com/language/translate/v2', [
                'key' => $this->apiKey,
                'q' => $texts,
                'target' => $googleTargetLanguage,
                'source' => $googleSourceLanguage,
                'format' => 'text'
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                $results = [];
                if (isset($data['data']['translations'])) {
                    foreach ($data['data']['translations'] as $translation) {
                        $results[] = $translation['translatedText'];
                    }
                }
                return $results;
            }
            
            Log::error('Batch translation API response: ' . $response->body());
            return $texts; // Return original texts on error
            
        } catch (\Exception $e) {
            Log::error('Batch translation failed: ' . $e->getMessage());
            return $texts; // Return original texts on error
        }
    }
    
    /**
     * Detect language of text
     *
     * @param string $text
     * @return string
     */
    public function detectLanguage(string $text): string
    {
        try {
            $response = Http::post('https://translation.googleapis.com/language/translate/v2/detect', [
                'key' => $this->apiKey,
                'q' => $text
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['data']['detections'][0][0]['language'])) {
                    $detectedLanguage = $data['data']['detections'][0][0]['language'];
                    return $this->mapGoogleLanguageCode($detectedLanguage);
                }
            }
            
            Log::error('Language detection API response: ' . $response->body());
            return 'en'; // Default to English on error
            
        } catch (\Exception $e) {
            Log::error('Language detection failed: ' . $e->getMessage());
            return 'en'; // Default to English on error
        }
    }
    
    /**
     * Get supported languages (Philippine languages only)
     *
     * @return array
     */
    public function getSupportedLanguages(): array
    {
        return [
            'en' => 'English',
            'tl' => 'Filipino (Tagalog)',
            'ceb' => 'Cebuano',
            'hil' => 'Hiligaynon (Ilonggo)',
            'ilo' => 'Ilocano',
            'war' => 'Waray',
            'pam' => 'Kapampangan',
            'bik' => 'Bikol',
            'pag' => 'Pangasinan',
            'mrw' => 'Maranao',
            'tsg' => 'Tausug',
            'mbb' => 'Manobo',
        ];
    }
    
    /**
     * Translate a section of translations
     *
     * @param array $translations
     * @param string $targetLanguage
     * @param string $sourceLanguage
     * @return array
     */
    public function translateSection(array $translations, string $targetLanguage, string $sourceLanguage = 'en'): array
    {
        $translated = [];
        
        foreach ($translations as $key => $value) {
            if (is_array($value)) {
                // Recursively translate nested arrays
                $translated[$key] = $this->translateSection($value, $targetLanguage, $sourceLanguage);
            } else {
                // Translate string values
                $translated[$key] = $this->translate($value, $targetLanguage, $sourceLanguage);
            }
        }
        
        return $translated;
    }
    
    /**
     * Map our language codes to Google's language codes
     *
     * @param string $code
     * @return string
     */
    private function mapLanguageCode(string $code): string
    {
        $mapping = [
            'en' => 'en',
            'tl' => 'tl',
            'ceb' => 'ceb',
            'hil' => 'hil',
            'ilo' => 'ilo',
            'war' => 'war',
            'pam' => 'pam',
            'bik' => 'bik',
            'pag' => 'pag',
            'mrw' => 'mrw',
            'tsg' => 'tsg',
            'mbb' => 'mbb',
        ];
        
        return $mapping[$code] ?? 'en';
    }
    
    /**
     * Map Google's language codes back to our codes
     *
     * @param string $googleCode
     * @return string
     */
    private function mapGoogleLanguageCode(string $googleCode): string
    {
        $mapping = [
            'en' => 'en',
            'tl' => 'tl',
            'ceb' => 'ceb',
            'hil' => 'hil',
            'ilo' => 'ilo',
            'war' => 'war',
            'pam' => 'pam',
            'bik' => 'bik',
            'pag' => 'pag',
            'mrw' => 'mrw',
            'tsg' => 'tsg',
            'mbb' => 'mbb',
        ];
        
        return $mapping[$googleCode] ?? 'en';
    }
}