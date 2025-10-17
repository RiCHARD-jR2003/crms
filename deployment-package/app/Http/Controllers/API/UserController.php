<?php
// app/Http/Controllers/API/UserController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with(['pwdMember', 'barangayPresident', 'admin'])->get();
        return response()->json($users);
    }

    public function store(Request $request)
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
            'status' => $request->status ?? 'active'
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
                'barangay' => $request->barangay,
            ]);
        } else if ($request->role === 'Admin') {
            $user->admin()->create();
        }

        return response()->json($user->load([$request->role === 'PWDMember' ? 'pwdMember' : 
                ($request->role === 'BarangayPresident' ? 'barangayPresident' : 'admin')]), 201);
    }

    public function show($id)
    {
        $user = User::with(['pwdMember', 'barangayPresident', 'admin'])->find($id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'username' => 'sometimes|required|unique:users,username,' . $id . ',userID',
            'email' => 'sometimes|required|email|unique:users,email,' . $id . ',userID',
            'password' => 'sometimes|min:6',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $userData = [];
        if ($request->has('username')) $userData['username'] = $request->username;
        if ($request->has('email')) $userData['email'] = $request->email;
        if ($request->has('password')) $userData['password'] = Hash::make($request->password);
        if ($request->has('status')) $userData['status'] = $request->status;

        if (!empty($userData)) {
            $user->update($userData);
        }

        // Update role-specific data
        if ($user->role === 'PWDMember' && $user->pwdMember) {
            $pwdData = [];
            if ($request->has('firstName')) $pwdData['firstName'] = $request->firstName;
            if ($request->has('lastName')) $pwdData['lastName'] = $request->lastName;
            if ($request->has('birthDate')) $pwdData['birthDate'] = $request->birthDate;
            if ($request->has('gender')) $pwdData['gender'] = $request->gender;
            if ($request->has('disabilityType')) $pwdData['disabilityType'] = $request->disabilityType;
            if ($request->has('address')) $pwdData['address'] = $request->address;
            
            if (!empty($pwdData)) {
                $user->pwdMember->update($pwdData);
            }
        } else if ($user->role === 'BarangayPresident' && $user->barangayPresident) {
            $brgyData = [];
            if ($request->has('barangayID')) $brgyData['barangayID'] = $request->barangayID;
            if ($request->has('barangay')) $brgyData['barangay'] = $request->barangay;
            
            if (!empty($brgyData)) {
                $user->barangayPresident->update($brgyData);
            }
        }

        return response()->json($user->load([$user->role === 'PWDMember' ? 'pwdMember' : 
                ($user->role === 'BarangayPresident' ? 'barangayPresident' : 'admin')]));
    }

    public function destroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}