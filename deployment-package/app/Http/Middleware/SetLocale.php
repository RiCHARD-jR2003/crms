<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Get language from header, session, or default to English
        $locale = $request->header('Accept-Language', 'en');
        
        // Extract language code (e.g., 'en-US' -> 'en')
        $locale = substr($locale, 0, 2);
        
        // Validate supported languages
        $supportedLocales = ['en', 'tl', 'bis', 'ilo', 'ceb', 'hil'];
        
        if (!in_array($locale, $supportedLocales)) {
            $locale = 'en';
        }
        
        // Set the application locale
        App::setLocale($locale);
        
        // Store in session for future requests
        Session::put('locale', $locale);
        
        return $next($request);
    }
}
