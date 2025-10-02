<?php
// app/Http/Controllers/API/AuthController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:Admin,BarangayPresident,PWDMember',
            'firstName' => 'required_if:role,PWDMember',
            'lastName' => 'required_if:role,PWDMember',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => 'active'
        ]);

        // Create role-specific record
        if ($request->role === 'PWDMember') {
            $user->pwdMember()->create([
                'firstName' => $request->firstName,
                'lastName' => $request->lastName,
                'birthDate' => $request->birthDate,
                'gender' => $request->gender,
                'disabilityType' => $request->disabilityType,
                'address' => $request->address,
            ]);
        } else if ($request->role === 'BarangayPresident') {
            $user->barangayPresident()->create([
                'barangayID' => $request->barangayID,
            ]);
        } else if ($request->role === 'Admin') {
            $user->admin()->create();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load([$request->role === 'PWDMember' ? 'pwdMember' : 
                     ($request->role === 'BarangayPresident' ? 'barangayPresident' : 'admin')]),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->only('username', 'password');
        
        // Find user by username first, then by email if not found
        $user = User::where('username', $request->username)->first();
        if (!$user) {
            $user = User::where('email', $request->username)->first();
        }
        
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }
        
        // Check if user is active
        if (strtolower($user->status) !== 'active') {
            return response()->json([
                'message' => 'Your account is inactive. Please contact administrator.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Load role-specific data
        if ($user->role === 'PWDMember') {
            // Check if pwdMember relationship exists
            if ($user->pwdMember) {
                $user->load('pwdMember');
                // Get barangay and idPictures from approved application
                $approvedApplication = $user->pwdMember->applications()
                    ->where('status', 'Approved')
                    ->latest()
                    ->first();
                if ($approvedApplication) {
                    $user->barangay = $approvedApplication->barangay;
                    // Add idPictures to pwdMember data
                    $user->pwdMember->idPictures = $approvedApplication->idPictures;
                }
            } else {
                // If no pwdMember relationship, get barangay and idPictures from application
                $approvedApplication = \App\Models\Application::where('email', $user->email)
                    ->where('status', 'Approved')
                    ->latest()
                    ->first();
                if ($approvedApplication) {
                    $user->barangay = $approvedApplication->barangay;
                    // Create a temporary pwdMember object with idPictures
                    $user->pwdMember = (object) [
                        'idPictures' => $approvedApplication->idPictures
                    ];
                }
            }
        } else if ($user->role === 'BarangayPresident') {
            try {
                $user->load('barangayPresident');
            } catch (\Exception $e) {
                // Handle missing barangay_president table gracefully
                \Log::warning('Barangay president table not available: ' . $e->getMessage());
                // Extract barangay from username (e.g., bp_gulod -> Gulod)
                $barangayName = 'Unknown';
                if (strpos($user->username, 'bp_') === 0) {
                    $barangayName = str_replace('bp_', '', $user->username);
                    $barangayName = str_replace('_', ' ', $barangayName);
                    $barangayName = ucwords(strtolower($barangayName));
                }
                // Set barangay data extracted from username
                $user->barangayPresident = (object) [
                    'barangay' => $barangayName,
                    'barangayID' => 1
                ];
            }
        } else if ($user->role === 'Admin') {
            try {
                $user->load('admin');
            } catch (\Exception $e) {
                // Handle missing admin table gracefully
                \Log::warning('Admin table not available: ' . $e->getMessage());
            }
        }

        // Sanitize user data to prevent UTF-8 encoding issues
        $userData = [
            'userID' => $user->userID,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];

        // Add role-specific data safely
        if ($user->role === 'PWDMember' && $user->pwdMember) {
            $userData['pwdMember'] = [
                'firstName' => $user->pwdMember->firstName ?? '',
                'lastName' => $user->pwdMember->lastName ?? '',
                'middleName' => $user->pwdMember->middleName ?? '',
                'birthDate' => $user->pwdMember->birthDate ?? '',
                'gender' => $user->pwdMember->gender ?? '',
                'disabilityType' => $user->pwdMember->disabilityType ?? '',
                'address' => $user->pwdMember->address ?? '',
                'contactNumber' => $user->pwdMember->contactNumber ?? '',
                'pwd_id' => $user->pwdMember->pwd_id ?? '',
            ];
            if (isset($user->barangay)) {
                $userData['barangay'] = $user->barangay;
            }
            if (isset($user->pwdMember->idPictures)) {
                $userData['pwdMember']['idPictures'] = $user->pwdMember->idPictures;
            }
        } else if ($user->role === 'BarangayPresident' && $user->barangayPresident) {
            $userData['barangayPresident'] = [
                'barangayID' => $user->barangayPresident->barangayID ?? '',
                'barangay' => $user->barangayPresident->barangay ?? '',
            ];
        } else if ($user->role === 'Admin' && $user->admin) {
            $userData['admin'] = [
                'userID' => $user->admin->userID ?? '',
            ];
        }

        return response()->json([
            'user' => $userData,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}