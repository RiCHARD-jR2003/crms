<?php
// app/Http/Controllers/API/PWDMemberController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PWDMember;
use Illuminate\Http\Request;

class PWDMemberController extends Controller
{
    public function index()
    {
        try {
            $members = PWDMember::all();
            return response()->json([
                'success' => true,
                'data' => $members,
                'count' => $members->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        // This is handled in UserController since PWDMember is created along with User
        return response()->json(['message' => 'Use /api/users endpoint to create PWD members'], 400);
    }

    public function show($id)
    {
        $member = PWDMember::with('user')->find($id);
        
        if (!$member) {
            return response()->json(['message' => 'PWD Member not found'], 404);
        }
        
        return response()->json($member);
    }

    public function update(Request $request, $id)
    {
        // This is handled in UserController since PWDMember is updated along with User
        return response()->json(['message' => 'Use /api/users endpoint to update PWD members'], 400);
    }

    public function destroy($id)
    {
        // This is handled in UserController since PWDMember is deleted along with User
        return response()->json(['message' => 'Use /api/users endpoint to delete PWD members'], 400);
    }

    public function getApplications($id)
    {
        $member = PWDMember::with('applications')->find($id);
        
        if (!$member) {
            return response()->json(['message' => 'PWD Member not found'], 404);
        }
        
        return response()->json($member->applications);
    }

    public function getComplaints($id)
    {
        $member = PWDMember::with('complaints')->find($id);
        
        if (!$member) {
            return response()->json(['message' => 'PWD Member not found'], 404);
        }
        
        return response()->json($member->complaints);
    }

    public function getBenefitClaims($id)
    {
        $member = PWDMember::with('benefitClaims.benefit')->find($id);
        
        if (!$member) {
            return response()->json(['message' => 'PWD Member not found'], 404);
        }
        
        return response()->json($member->benefitClaims);
    }
}