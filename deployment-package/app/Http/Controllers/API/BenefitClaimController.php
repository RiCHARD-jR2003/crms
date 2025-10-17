<?php
// app/Http/Controllers/API/BenefitClaimController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BenefitClaim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BenefitClaimController extends Controller
{
    public function index()
    {
        $claims = BenefitClaim::with('pwdMember.user', 'benefit')->get();
        return response()->json($claims);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pwdID' => 'required|exists:pwd_members,userID',
            'benefitID' => 'required|exists:benefits,benefitID',
            'claimDate' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $claim = BenefitClaim::create([
            'pwdID' => $request->pwdID,
            'benefitID' => $request->benefitID,
            'claimDate' => $request->claimDate,
            'status' => 'Unclaimed',
        ]);

        return response()->json($claim->load('pwdMember.user', 'benefit'), 201);
    }

    public function show($id)
    {
        $claim = BenefitClaim::with('pwdMember.user', 'benefit')->find($id);
        
        if (!$claim) {
            return response()->json(['message' => 'Benefit claim not found'], 404);
        }
        
        return response()->json($claim);
    }

    public function update(Request $request, $id)
    {
        $claim = BenefitClaim::find($id);
        
        if (!$claim) {
            return response()->json(['message' => 'Benefit claim not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'claimDate' => 'sometimes|required|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $claim->update($request->only(['claimDate']));

        return response()->json($claim->load('pwdMember.user', 'benefit'));
    }

    public function destroy($id)
    {
        $claim = BenefitClaim::find($id);
        
        if (!$claim) {
            return response()->json(['message' => 'Benefit claim not found'], 404);
        }

        $claim->delete();

        return response()->json(['message' => 'Benefit claim deleted successfully']);
    }

    public function updateStatus(Request $request, $id)
    {
        $claim = BenefitClaim::find($id);
        
        if (!$claim) {
            return response()->json(['message' => 'Benefit claim not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Claimed,Unclaimed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $claim->update(['status' => $request->status]);

        return response()->json($claim->load('pwdMember.user', 'benefit'));
    }
}