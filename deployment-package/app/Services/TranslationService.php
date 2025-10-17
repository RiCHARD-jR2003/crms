<?php

namespace App\Services;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;

class TranslationService
{
    private static $googleTranslateService;
    
    /**
     * Get Google Translate service instance
     *
     * @return GoogleTranslateService
     */
    private static function getGoogleTranslateService(): GoogleTranslateService
    {
        if (!self::$googleTranslateService) {
            self::$googleTranslateService = new GoogleTranslateService();
        }
        return self::$googleTranslateService;
    }
    
    /**
     * Get translated message using Google Translate
     *
     * @param string $key
     * @param array $replace
     * @param string|null $locale
     * @return string
     */
    public static function get(string $key, array $replace = [], string $locale = null): string
    {
        $currentLocale = $locale ?? App::getLocale();
        
        // If English, return the key as is
        if ($currentLocale === 'en') {
            return $key;
        }
        
        // Cache key for translation
        $cacheKey = "translation_{$currentLocale}_{$key}";
        
        // Try to get from cache first
        $translation = Cache::get($cacheKey);
        
        if (!$translation) {
            // Translate using Google Translate
            $googleTranslate = self::getGoogleTranslateService();
            
            // Map our language codes to Google's codes
            $googleLanguageCode = self::mapLanguageCode($currentLocale);
            
            $translation = $googleTranslate->translate($key, $googleLanguageCode, 'en');
            
            // Cache the translation for 24 hours
            Cache::put($cacheKey, $translation, 86400);
        }
        
        // Replace placeholders if any
        foreach ($replace as $placeholder => $value) {
            $translation = str_replace(":{$placeholder}", $value, $translation);
        }
        
        return $translation;
    }
    
    /**
     * Get all translations for a specific section using Google Translate
     *
     * @param string $section
     * @param string|null $locale
     * @return array
     */
    public static function getSection(string $section, string $locale = null): array
    {
        $currentLocale = $locale ?? App::getLocale();
        
        // If English, return empty array (no translation needed)
        if ($currentLocale === 'en') {
            return [];
        }
        
        // Cache key for section translation
        $cacheKey = "translation_section_{$currentLocale}_{$section}";
        
        // Try to get from cache first
        $translations = Cache::get($cacheKey);
        
        if (!$translations) {
            // Get base English translations for this section
            $baseTranslations = self::getBaseTranslations($section);
            
            if (empty($baseTranslations)) {
                return [];
            }
            
            // Translate using Google Translate
            $googleTranslate = self::getGoogleTranslateService();
            $googleLanguageCode = self::mapLanguageCode($currentLocale);
            
            $translations = $googleTranslate->translateSection($baseTranslations, $googleLanguageCode, 'en');
            
            // Cache the translations for 24 hours
            Cache::put($cacheKey, $translations, 86400);
        }
        
        return $translations;
    }
    
    /**
     * Get supported languages
     *
     * @return array
     */
    public static function getSupportedLanguages(): array
    {
        return [
            'en' => 'English',
            'tl' => 'Tagalog',
            'bis' => 'Bisaya',
        ];
    }
    
    /**
     * Get language name by code
     *
     * @param string $code
     * @return string
     */
    public static function getLanguageName(string $code): string
    {
        $languages = self::getSupportedLanguages();
        return $languages[$code] ?? $code;
    }
    
    /**
     * Map our language codes to Google's language codes
     *
     * @param string $code
     * @return string
     */
    private static function mapLanguageCode(string $code): string
    {
        $mapping = [
            'en' => 'en',
            'tl' => 'tl',
            'bis' => 'ceb', // Google uses 'ceb' for Cebuano/Bisaya
        ];
        
        return $mapping[$code] ?? 'en';
    }
    
    /**
     * Get base English translations for a section
     *
     * @param string $section
     * @return array
     */
    private static function getBaseTranslations(string $section): array
    {
        // Define base English translations for each section
        $baseTranslations = [
            'common' => [
                'login' => 'Login',
                'logout' => 'Logout',
                'register' => 'Register',
                'username' => 'Username',
                'password' => 'Password',
                'email' => 'Email',
                'submit' => 'Submit',
                'cancel' => 'Cancel',
                'save' => 'Save',
                'edit' => 'Edit',
                'delete' => 'Delete',
                'search' => 'Search',
                'loading' => 'Loading...',
                'error' => 'Error',
                'success' => 'Success',
                'warning' => 'Warning',
                'info' => 'Information',
                'yes' => 'Yes',
                'no' => 'No',
                'back' => 'Back',
                'next' => 'Next',
                'previous' => 'Previous',
                'close' => 'Close',
                'open' => 'Open',
                'view' => 'View',
                'download' => 'Download',
                'upload' => 'Upload',
                'print' => 'Print',
                'refresh' => 'Refresh',
                'settings' => 'Settings',
                'profile' => 'Profile',
                'dashboard' => 'Dashboard',
                'home' => 'Home',
                'about' => 'About',
                'contact' => 'Contact',
                'help' => 'Help',
                'support' => 'Support',
                'language' => 'Language',
                'accessibility' => 'Accessibility',
                'textToSpeech' => 'Text to Speech',
                'speakText' => 'Speak Text',
                'stopSpeaking' => 'Stop Speaking',
                'increaseVolume' => 'Increase Volume',
                'decreaseVolume' => 'Decrease Volume',
                'increaseSpeed' => 'Increase Speed',
                'decreaseSpeed' => 'Decrease Speed',
            ],
            'auth' => [
                'loginTitle' => 'Login',
                'loginSubtitle' => 'Access your PDAO account',
                'usernameRequired' => 'Username is required',
                'passwordRequired' => 'Password is required',
                'loginFailed' => 'Login failed. Please try again.',
                'forgotPassword' => 'Forgot Password?',
                'dontHaveAccount' => 'Don\'t have an account? Register',
                'welcomeMessage' => 'Welcome to PDAO',
                'cityName' => 'Cabuyao City',
                'officeDescription' => 'Persons with Disabilities Affairs Office - Cabuyao City',
                'officeTagline' => 'Empowering lives through inclusive services and support.',
                'pdaoOffice' => 'PDAO Office',
                'cabuyao' => 'Cabuyao',
                'lungsodNgCabuyao' => 'LUNGSOD NG CABUYAO',
            ],
            'admin' => [
                'dashboard' => 'Admin Dashboard',
                'welcome' => 'Welcome, Admin',
                'totalMembers' => 'Total PWD Members',
                'pendingApplications' => 'Pending Applications',
                'totalBenefits' => 'Total Benefits',
                'recentActivities' => 'Recent Activities',
                'pwdRecords' => 'PWD Records',
                'pwdCards' => 'PWD Cards',
                'reports' => 'Reports',
                'ayuda' => 'Ayuda Distribution',
                'announcements' => 'Announcements',
                'supportDesk' => 'Support Desk',
                'benefitTracking' => 'Benefit Tracking',
                'addNew' => 'Add New',
                'viewAll' => 'View All',
                'manageMembers' => 'Manage Members',
                'manageApplications' => 'Manage Applications',
                'manageBenefits' => 'Manage Benefits',
                'systemSettings' => 'System Settings',
                'userManagement' => 'User Management',
                'auditLogs' => 'Audit Logs',
            ],
            'barangayPresident' => [
                'dashboard' => 'Barangay President Dashboard',
                'welcome' => 'Welcome, Barangay President',
                'pwdRecords' => 'PWD Records',
                'pwdCards' => 'PWD Cards',
                'reports' => 'Reports',
                'ayuda' => 'Ayuda Distribution',
                'announcements' => 'Announcements',
                'myBarangay' => 'My Barangay',
                'memberCount' => 'Member Count',
                'pendingCount' => 'Pending Count',
                'approvedCount' => 'Approved Count',
                'rejectedCount' => 'Rejected Count',
            ],
            'pwdMember' => [
                'dashboard' => 'PWD Member Dashboard',
                'welcome' => 'Welcome, PWD Member',
                'myProfile' => 'My Profile',
                'myApplications' => 'My Applications',
                'myBenefits' => 'My Benefits',
                'announcements' => 'Announcements',
                'supportDesk' => 'Support Desk',
                'myPwdCard' => 'My PWD Card',
                'applicationStatus' => 'Application Status',
                'benefitStatus' => 'Benefit Status',
                'updateProfile' => 'Update Profile',
                'viewCard' => 'View Card',
                'downloadCard' => 'Download Card',
            ],
            'forms' => [
                'personalInfo' => 'Personal Information',
                'contactInfo' => 'Contact Information',
                'disabilityInfo' => 'Disability Information',
                'medicalInfo' => 'Medical Information',
                'addressInfo' => 'Address Information',
                'firstName' => 'First Name',
                'lastName' => 'Last Name',
                'middleName' => 'Middle Name',
                'birthDate' => 'Birth Date',
                'gender' => 'Gender',
                'phoneNumber' => 'Phone Number',
                'address' => 'Address',
                'barangay' => 'Barangay',
                'city' => 'City',
                'province' => 'Province',
                'zipCode' => 'Zip Code',
                'disabilityType' => 'Disability Type',
                'disabilityLevel' => 'Disability Level',
                'medicalCondition' => 'Medical Condition',
                'required' => 'Required',
                'optional' => 'Optional',
                'submitApplication' => 'Submit Application',
                'updateApplication' => 'Update Application',
                'cancelApplication' => 'Cancel Application',
            ],
            'tables' => [
                'id' => 'ID',
                'name' => 'Name',
                'email' => 'Email',
                'phone' => 'Phone',
                'barangay' => 'Barangay',
                'status' => 'Status',
                'dateCreated' => 'Date Created',
                'actions' => 'Actions',
                'view' => 'View',
                'edit' => 'Edit',
                'delete' => 'Delete',
                'approve' => 'Approve',
                'reject' => 'Reject',
                'pending' => 'Pending',
                'approved' => 'Approved',
                'rejected' => 'Rejected',
                'active' => 'Active',
                'inactive' => 'Inactive',
                'noData' => 'No data available',
                'loading' => 'Loading...',
                'search' => 'Search',
                'filter' => 'Filter',
                'export' => 'Export',
                'import' => 'Import',
            ],
            'messages' => [
                'success' => [
                    'saved' => 'Data saved successfully',
                    'updated' => 'Data updated successfully',
                    'deleted' => 'Data deleted successfully',
                    'approved' => 'Application approved successfully',
                    'rejected' => 'Application rejected successfully',
                ],
                'error' => [
                    'save' => 'Failed to save data',
                    'update' => 'Failed to update data',
                    'delete' => 'Failed to delete data',
                    'load' => 'Failed to load data',
                    'network' => 'Network error occurred',
                    'unauthorized' => 'Unauthorized access',
                    'notFound' => 'Data not found',
                ],
                'confirm' => [
                    'delete' => 'Are you sure you want to delete this item?',
                    'approve' => 'Are you sure you want to approve this application?',
                    'reject' => 'Are you sure you want to reject this application?',
                ],
            ],
        ];
        
        return $baseTranslations[$section] ?? [];
    }
}
