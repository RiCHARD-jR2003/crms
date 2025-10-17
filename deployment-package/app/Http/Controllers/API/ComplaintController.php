<?php
// app/Http/Controllers/API/ComplaintController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ComplaintController extends Controller
{
    public function index()
    {
        $complaints = Complaint::with('pwdMember.user')->get();
        return response()->json($complaints);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pwdID' => 'required|exists:pwd_members,userID',
            'subject' => 'required|string|max:100',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $complaint = Complaint::create([
            'pwdID' => $request->pwdID,
            'subject' => $request->subject,
            'description' => $request->description,
            'status' => 'Pending',
        ]);

        return response()->json($complaint->load('pwdMember.user'), 201);
    }

    public function show($id)
    {
        $complaint = Complaint::with('pwdMember.user')->find($id);
        
        if (!$complaint) {
            return response()->json(['message' => 'Complaint not found'], 404);
        }
        
        return response()->json($complaint);
    }

    public function update(Request $request, $id)
    {
        $complaint = Complaint::find($id);
        
        if (!$complaint) {
            return response()->json(['message' => 'Complaint not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'subject' => 'sometimes|required|string|max:100',
            'description' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $complaint->update($request->only(['subject', 'description']));

        return response()->json($complaint->load('pwdMember.user'));
    }

    public function destroy($id)
    {
        $complaint = Complaint::find($id);
        
        if (!$complaint) {
            return response()->json(['message' => 'Complaint not found'], 404);
        }

        $complaint->delete();

        return response()->json(['message' => 'Complaint deleted successfully']);
    }

    public function updateStatus(Request $request, $id)
    {
        $complaint = Complaint::find($id);
        
        if (!$complaint) {
            return response()->json(['message' => 'Complaint not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Pending,Resolved',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $complaint->update(['status' => $request->status]);

        return response()->json($complaint->load('pwdMember.user'));
    }
}