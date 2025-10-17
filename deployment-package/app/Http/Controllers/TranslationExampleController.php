<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GoogleTranslateService;
use App\Services\TranslationService;

class TranslationExampleController extends Controller
{
    private $googleTranslateService;
    
    public function __construct()
    {
        $this->googleTranslateService = new GoogleTranslateService();
    }
    
    /**
     * Example of using Google Translate Service directly
     */
    public function directTranslation(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'target_language' => 'required|string|in:en,tl,bis',
            'source_language' => 'string|in:en,tl,bis'
        ]);
        
        $text = $request->input('text');
        $targetLanguage = $request->input('target_language');
        $sourceLanguage = $request->input('source_language', 'en');
        
        try {
            // Map our language codes to Google's codes
            $googleTargetLanguage = $this->mapLanguageCode($targetLanguage);
            $googleSourceLanguage = $this->mapLanguageCode($sourceLanguage);
            
            $translatedText = $this->googleTranslateService->translate(
                $text, 
                $googleTargetLanguage, 
                $googleSourceLanguage
            );
            
            return response()->json([
                'success' => true,
                'original_text' => $text,
                'translated_text' => $translatedText,
                'source_language' => $sourceLanguage,
                'target_language' => $targetLanguage,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Translation failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Example of using TranslationService (with caching)
     */
    public function cachedTranslation(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'target_language' => 'required|string|in:en,tl,bis'
        ]);
        
        $text = $request->input('text');
        $targetLanguage = $request->input('target_language');
        
        try {
            $translatedText = TranslationService::get($text, [], $targetLanguage);
            
            return response()->json([
                'success' => true,
                'original_text' => $text,
                'translated_text' => $translatedText,
                'target_language' => $targetLanguage,
                'cached' => true, // This will be cached for 24 hours
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Translation failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Example of batch translation
     */
    public function batchTranslation(Request $request)
    {
        $request->validate([
            'texts' => 'required|array',
            'texts.*' => 'string',
            'target_language' => 'required|string|in:en,tl,bis',
            'source_language' => 'string|in:en,tl,bis'
        ]);
        
        $texts = $request->input('texts');
        $targetLanguage = $request->input('target_language');
        $sourceLanguage = $request->input('source_language', 'en');
        
        try {
            // Map our language codes to Google's codes
            $googleTargetLanguage = $this->mapLanguageCode($targetLanguage);
            $googleSourceLanguage = $this->mapLanguageCode($sourceLanguage);
            
            $translatedTexts = $this->googleTranslateService->translateBatch(
                $texts, 
                $googleTargetLanguage, 
                $googleSourceLanguage
            );
            
            return response()->json([
                'success' => true,
                'original_texts' => $texts,
                'translated_texts' => $translatedTexts,
                'source_language' => $sourceLanguage,
                'target_language' => $targetLanguage,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Batch translation failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Example of language detection
     */
    public function detectLanguage(Request $request)
    {
        $request->validate([
            'text' => 'required|string'
        ]);
        
        $text = $request->input('text');
        
        try {
            $detectedLanguage = $this->googleTranslateService->detectLanguage($text);
            
            // Map Google's language code back to our code
            $ourLanguageCode = $this->mapGoogleLanguageCode($detectedLanguage);
            
            return response()->json([
                'success' => true,
                'text' => $text,
                'detected_language' => $ourLanguageCode,
                'confidence' => 1.0,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Language detection failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Map our language codes to Google's language codes
     */
    private function mapLanguageCode(string $code): string
    {
        $mapping = [
            'en' => 'en',
            'tl' => 'tl',
            'bis' => 'ceb', // Google uses 'ceb' for Cebuano/Bisaya
        ];
        
        return $mapping[$code] ?? 'en';
    }
    
    /**
     * Map Google's language codes back to our codes
     */
    private function mapGoogleLanguageCode(string $googleCode): string
    {
        $mapping = [
            'en' => 'en',
            'tl' => 'tl',
            'ceb' => 'bis', // Map Google's 'ceb' back to our 'bis'
        ];
        
        return $mapping[$googleCode] ?? 'en';
    }
}
