<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GoogleTranslateService;

class TranslateController extends Controller
{
    private $googleTranslateService;
    
    public function __construct()
    {
        $this->googleTranslateService = new GoogleTranslateService();
    }
    
    /**
     * Translate a single text
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function translate(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'target_language' => 'required|string|in:en,tl,ceb,hil,ilo,war,pam,bik,pag,mrw,tsg,mbb',
            'source_language' => 'string|in:en,tl,ceb,hil,ilo,war,pam,bik,pag,mrw,tsg,mbb'
        ]);
        
        $text = $request->input('text');
        $targetLanguage = $request->input('target_language');
        $sourceLanguage = $request->input('source_language', 'en');
        
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
    }
    
    /**
     * Translate multiple texts at once
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function translateBatch(Request $request)
    {
        $request->validate([
            'texts' => 'required|array',
            'texts.*' => 'string',
            'target_language' => 'required|string|in:en,tl,ceb,hil,ilo,war,pam,bik,pag,mrw,tsg,mbb',
            'source_language' => 'string|in:en,tl,ceb,hil,ilo,war,pam,bik,pag,mrw,tsg,mbb'
        ]);
        
        $texts = $request->input('texts');
        $targetLanguage = $request->input('target_language');
        $sourceLanguage = $request->input('source_language', 'en');
        
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
    }
    
    /**
     * Detect language of text
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function detectLanguage(Request $request)
    {
        $request->validate([
            'text' => 'required|string'
        ]);
        
        $text = $request->input('text');
        
        $detectedLanguage = $this->googleTranslateService->detectLanguage($text);
        
        // Map Google's language code back to our code
        $ourLanguageCode = $this->mapGoogleLanguageCode($detectedLanguage);
        
        return response()->json([
            'success' => true,
            'text' => $text,
            'detected_language' => $ourLanguageCode,
            'confidence' => 1.0, // Google Translate doesn't provide confidence scores in this API
        ]);
    }
    
    /**
     * Translate a section of translations
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function translateSection(Request $request)
    {
        $request->validate([
            'translations' => 'required|array',
            'target_language' => 'required|string|in:en,tl,ceb,hil,ilo,war,pam,bik,pag,mrw,tsg,mbb',
            'source_language' => 'string|in:en,tl,ceb,hil,ilo,war,pam,bik,pag,mrw,tsg,mbb'
        ]);
        
        $translations = $request->input('translations');
        $targetLanguage = $request->input('target_language');
        $sourceLanguage = $request->input('source_language', 'en');
        
        // Map our language codes to Google's codes
        $googleTargetLanguage = $this->mapLanguageCode($targetLanguage);
        $googleSourceLanguage = $this->mapLanguageCode($sourceLanguage);
        
        $translatedTranslations = $this->googleTranslateService->translateSection(
            $translations, 
            $googleTargetLanguage, 
            $googleSourceLanguage
        );
        
        return response()->json([
            'success' => true,
            'original_translations' => $translations,
            'translated_translations' => $translatedTranslations,
            'source_language' => $sourceLanguage,
            'target_language' => $targetLanguage,
        ]);
    }
    
    /**
     * Get supported languages
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSupportedLanguages()
    {
        $languages = $this->googleTranslateService->getSupportedLanguages();
        
        return response()->json([
            'success' => true,
            'languages' => $languages,
        ]);
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
            'bis' => 'ceb', // Google uses 'ceb' for Cebuano/Bisaya
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
            'ceb' => 'bis', // Map Google's 'ceb' back to our 'bis'
        ];
        
        return $mapping[$googleCode] ?? 'en';
    }
}
