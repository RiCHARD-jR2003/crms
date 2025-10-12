<?php
// app/Http/Controllers/API/BenefitController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Benefit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BenefitController extends Controller
{
    public function index()
    {
        $benefits = Benefit::all();
        return response()->json($benefits);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'amount' => 'required|string|max:50',
            'description' => 'required|string',
            'barangay' => 'nullable|string|max:100',
            'selectedBarangays' => 'nullable|array',
            'quarter' => 'nullable|string|max:50',
            'birthdayMonth' => 'nullable|string|max:10',
            'status' => 'nullable|string|max:50',
            'distributionDate' => 'required|date|after:today',
            'expiryDate' => 'required|date|after:distributionDate',
            'targetRecipients' => 'nullable|string',
            'distributed' => 'nullable|integer',
            'pending' => 'nullable|integer',
            'color' => 'nullable|string|max:20',
            'submittedDate' => 'nullable|date',
            'approvalFile' => 'nullable|string',
            'approvedDate' => 'nullable|date',
            // Legacy fields for backward compatibility
            'benefitType' => 'nullable|string|max:50',
            'schedule' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $benefit = Benefit::create($request->all());

        return response()->json($benefit, 201);
    }

    public function show($id)
    {
        $benefit = Benefit::find($id);
        
        if (!$benefit) {
            return response()->json(['message' => 'Benefit not found'], 404);
        }
        
        return response()->json($benefit);
    }

    public function update(Request $request, $id)
    {
        $benefit = Benefit::find($id);
        
        if (!$benefit) {
            return response()->json(['message' => 'Benefit not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:50',
            'amount' => 'sometimes|required|string|max:50',
            'description' => 'sometimes|required|string',
            'barangay' => 'nullable|string|max:100',
            'quarter' => 'nullable|string|max:50',
            'birthdayMonth' => 'nullable|string|max:10',
            'status' => 'nullable|string|max:50',
            'distributionDate' => 'sometimes|required|date|after:today',
            'expiryDate' => 'sometimes|required|date|after:distributionDate',
            'targetRecipients' => 'nullable|string',
            'distributed' => 'nullable|integer',
            'pending' => 'nullable|integer',
            'color' => 'nullable|string|max:20',
            'submittedDate' => 'nullable|date',
            'approvalFile' => 'nullable|string',
            'approvedDate' => 'nullable|date',
            // Legacy fields for backward compatibility
            'benefitType' => 'nullable|string|max:50',
            'schedule' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $benefit->update($request->all());

        return response()->json($benefit);
    }

    public function destroy($id)
    {
        $benefit = Benefit::find($id);
        
        if (!$benefit) {
            return response()->json(['message' => 'Benefit not found'], 404);
        }

        $benefit->delete();

        return response()->json(['message' => 'Benefit deleted successfully']);
    }
}