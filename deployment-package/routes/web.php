<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-web', function () {
    return response()->json(['message' => 'Web routes are working']);
});

Route::get('/api/test-web', function () {
    return response()->json(['message' => 'API test via web routes']);
});

// Add a login route for web authentication redirects
Route::get('/login', function () {
    return response()->json(['message' => 'Please login to access this resource'], 401);
})->name('login');