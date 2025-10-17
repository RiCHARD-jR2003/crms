<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Services\TranslationService;

class LanguageController extends Controller
{
    /**
     * Change application language for current user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changeLanguage(Request $request)
    {
        $request->validate([
            'locale' => 'required|string|in:en,tl,bis'
        ]);
        
        $locale = $request->input('locale');
        
        // Set the application locale
        App::setLocale($locale);
        
        // Store in session
        Session::put('locale', $locale);
        
        // Store user's language preference in database if authenticated
        if (Auth::check()) {
            $user = Auth::user();
            $userTable = $this->getUserTable($user);
            
            if ($userTable) {
                DB::table($userTable)
                    ->where('id', $user->id)
                    ->update(['preferred_language' => $locale]);
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => TranslationService::get('messages.login_success'),
            'locale' => $locale,
            'language_name' => TranslationService::getLanguageName($locale),
            'user_preference_saved' => Auth::check(),
            'translations' => [
                'common' => TranslationService::getSection('common'),
                'auth' => TranslationService::getSection('auth'),
                'admin' => TranslationService::getSection('admin'),
                'barangayPresident' => TranslationService::getSection('barangayPresident'),
                'pwdMember' => TranslationService::getSection('pwdMember'),
                'forms' => TranslationService::getSection('forms'),
                'tables' => TranslationService::getSection('tables'),
                'messages' => TranslationService::getSection('messages'),
            ]
        ]);
    }
    
    /**
     * Get current language and translations
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCurrentLanguage()
    {
        $locale = App::getLocale();
        
        // Get user's preferred language if authenticated
        $userPreferredLanguage = null;
        if (Auth::check()) {
            $user = Auth::user();
            $userTable = $this->getUserTable($user);
            
            if ($userTable) {
                $userData = DB::table($userTable)
                    ->where('id', $user->id)
                    ->select('preferred_language')
                    ->first();
                
                if ($userData && $userData->preferred_language) {
                    $userPreferredLanguage = $userData->preferred_language;
                    // Set the locale to user's preference
                    App::setLocale($userPreferredLanguage);
                    $locale = $userPreferredLanguage;
                }
            }
        }
        
        return response()->json([
            'success' => true,
            'locale' => $locale,
            'user_preferred_language' => $userPreferredLanguage,
            'language_name' => TranslationService::getLanguageName($locale),
            'supported_languages' => TranslationService::getSupportedLanguages(),
            'translations' => [
                'common' => TranslationService::getSection('common'),
                'auth' => TranslationService::getSection('auth'),
                'admin' => TranslationService::getSection('admin'),
                'barangayPresident' => TranslationService::getSection('barangayPresident'),
                'pwdMember' => TranslationService::getSection('pwdMember'),
                'forms' => TranslationService::getSection('forms'),
                'tables' => TranslationService::getSection('tables'),
                'messages' => TranslationService::getSection('messages'),
            ]
        ]);
    }
    
    /**
     * Get all supported languages
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSupportedLanguages()
    {
        return response()->json([
            'success' => true,
            'supported_languages' => TranslationService::getSupportedLanguages()
        ]);
    }
    
    /**
     * Get the appropriate user table based on user type
     *
     * @param mixed $user
     * @return string|null
     */
    private function getUserTable($user)
    {
        if (!$user) {
            return null;
        }
        
        // Determine user type based on the user object or role
        $userType = $user->role ?? $user->user_type ?? null;
        
        switch ($userType) {
            case 'Admin':
                return 'admin';
            case 'BarangayPresident':
                return 'barangay_president';
            case 'PWDMember':
                return 'pwd_member';
            default:
                // Try to determine from the model class
                $className = get_class($user);
                if (strpos($className, 'Admin') !== false) {
                    return 'admin';
                } elseif (strpos($className, 'BarangayPresident') !== false) {
                    return 'barangay_president';
                } elseif (strpos($className, 'PWDMember') !== false) {
                    return 'pwd_member';
                }
                return null;
        }
    }
}
