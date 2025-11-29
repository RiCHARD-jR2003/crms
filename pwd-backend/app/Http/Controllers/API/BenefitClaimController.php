<?php
// app/Http/Controllers/API/BenefitClaimController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BenefitClaim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BenefitClaimController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->get('user_id');
        $cacheKey = $userId ? "benefit_claims:user:{$userId}" : "benefit_claims:all";
        
        // Cache for 2 minutes (120 seconds) - claims change frequently
        $claims = Cache::remember($cacheKey, 120, function() use ($userId) {
            $query = BenefitClaim::selectEssential()
                ->with([
                    'pwdMember' => function($q) {
                        $q->select(['userID', 'firstName', 'lastName', 'barangay']);
                    },
                    'benefit' => function($q) {
                        $q->select(['id', 'title', 'type', 'amount', 'status']);
                    }
                ])
                ->recentFirst();
            
            if ($userId) {
                $query->forUser($userId);
            }
            
            return $query->limit(1000)->get();
        });
        
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
        $cacheKey = "benefit_claim:show:{$id}";
        
        $claim = Cache::remember($cacheKey, 300, function() use ($id) {
            return BenefitClaim::selectEssential()
                ->with([
                    'pwdMember' => function($q) {
                        $q->select(['userID', 'firstName', 'lastName', 'barangay']);
                    },
                    'benefit' => function($q) {
                        $q->select(['id', 'title', 'type', 'amount', 'status']);
                    }
                ])
                ->find($id);
        });
        
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

        // Clear cache
        Cache::forget("benefit_claim:show:{$id}");
        Cache::forget("benefit_claims:user:{$claim->pwdID}");
        Cache::forget("benefit_claims:all");

        return response()->json($claim->load([
            'pwdMember' => function($q) {
                $q->select(['userID', 'firstName', 'lastName', 'barangay']);
            },
            'benefit' => function($q) {
                $q->select(['id', 'title', 'type', 'amount', 'status']);
            }
        ]));
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

        // Clear cache
        Cache::forget("benefit_claim:show:{$id}");
        Cache::forget("benefit_claims:user:{$claim->pwdID}");
        Cache::forget("benefit_claims:all");

        return response()->json($claim->load([
            'pwdMember' => function($q) {
                $q->select(['userID', 'firstName', 'lastName', 'barangay']);
            },
            'benefit' => function($q) {
                $q->select(['id', 'title', 'type', 'amount', 'status']);
            }
        ]));
    }

    /**
     * Handle QR scan claim benefits with claimant information
     */
    public function claimBenefits(Request $request)
    {
        try {
            \Illuminate\Support\Facades\Log::info('QR scan claim benefits request', [
                'request_data' => $request->except(['authorizationLetter']),
                'has_file' => $request->hasFile('authorizationLetter'),
                'content_type' => $request->header('Content-Type'),
            ]);

            // Validate required fields
            $validator = Validator::make($request->all(), [
                'memberId' => 'required',
                'pwdId' => 'required',
                'qrCodeHash' => 'nullable', // Make optional for now, can verify later if needed
                'claimantType' => 'required|in:Member,Guardian,Others',
                'claimantName' => 'required_if:claimantType,Others',
                'claimantRelation' => 'required_if:claimantType,Others',
                'authorizationLetter' => 'nullable|file|image|mimes:jpeg,jpg,png,pdf|max:10240',
                'benefitID' => 'sometimes',
            ]);

            if ($validator->fails()) {
                \Illuminate\Support\Facades\Log::error('QR scan claim benefits validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return response()->json([
                    'success' => false,
                    'error' => 'Validation failed: ' . $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 400);
            }

            // Find the PWD member - try multiple lookup strategies
            $member = null;
            
            // Try to find by userID first (most reliable)
            if ($request->memberId) {
                // Check if memberId looks like a pwd_id (starts with "PWD-")
                if (strpos($request->memberId, 'PWD-') === 0) {
                    // memberId is actually a pwd_id, try finding by pwd_id
                    $member = \App\Models\PWDMember::where('pwd_id', $request->memberId)->first();
                } else {
                    // memberId is likely a userID, try finding by userID
                    $member = \App\Models\PWDMember::where('userID', $request->memberId)->first();
                }
            }
            
            // If not found, try by pwd_id field using memberId (if it looks like a pwd_id)
            if (!$member && $request->memberId && strpos($request->memberId, 'PWD-') === 0) {
                $member = \App\Models\PWDMember::where('pwd_id', $request->memberId)->first();
            }
            
            // If not found, try by pwd_id field using pwdId (if it's not "PWD-undefined")
            if (!$member && $request->pwdId && $request->pwdId !== 'PWD-undefined' && strpos($request->pwdId, 'PWD-') === 0) {
                $member = \App\Models\PWDMember::where('pwd_id', $request->pwdId)->first();
            }
            
            // If not found, try by database id (pwdId might be the database id, if it's numeric)
            if (!$member && $request->pwdId && $request->pwdId !== 'PWD-undefined' && is_numeric($request->pwdId)) {
                $member = \App\Models\PWDMember::find($request->pwdId);
            }
            
            // If still not found, try by pwd_id field using pwdId (any format)
            if (!$member && $request->pwdId && $request->pwdId !== 'PWD-undefined') {
                $member = \App\Models\PWDMember::where('pwd_id', $request->pwdId)->first();
            }
            
            // Last resort: try by memberId as database id (if it's numeric)
            if (!$member && $request->memberId && is_numeric($request->memberId)) {
                $member = \App\Models\PWDMember::find($request->memberId);
            }

            if (!$member) {
                \Illuminate\Support\Facades\Log::error('PWD member not found in claim benefits', [
                    'memberId' => $request->memberId,
                    'pwdId' => $request->pwdId,
                    'request_data' => $request->except(['authorizationLetter'])
                ]);
                
                return response()->json([
                    'success' => false,
                    'error' => 'PWD member not found',
                    'debug' => [
                        'memberId_received' => $request->memberId,
                        'pwdId_received' => $request->pwdId
                    ]
                ], 404);
            }
            
            \Illuminate\Support\Facades\Log::info('PWD member found in claim benefits', [
                'member_id' => $member->userID,
                'pwd_id' => $member->pwd_id,
                'memberId_received' => $request->memberId,
                'pwdId_received' => $request->pwdId
            ]);

            // Verify QR code hash if provided and member has one
            if ($request->has('qrCodeHash') && $request->qrCodeHash && $member->qr_code_hash) {
                if ($member->qr_code_hash !== $request->qrCodeHash) {
                    \Illuminate\Support\Facades\Log::warning('QR code hash mismatch', [
                        'member_id' => $member->userID,
                        'expected' => $member->qr_code_hash,
                        'received' => $request->qrCodeHash
                    ]);
                    // Don't fail, just log - QR codes might not always have hash
                }
            }

            // Handle authorization letter upload if provided
            $authorizationLetterPath = null;
            if ($request->hasFile('authorizationLetter')) {
                $file = $request->file('authorizationLetter');
                $fileName = 'authorization_' . time() . '_' . $member->userID . '.' . $file->getClientOriginalExtension();
                $authorizationLetterPath = $file->storeAs('authorization_letters', $fileName, 'public');
            }

            // Get active benefits - filter by member's barangay
            $memberBarangay = $member->barangay;
            $benefits = [];
            
            if ($request->has('benefitID')) {
                // Claim specific benefit - benefit table only has 'id' column, not 'benefitID'
                $benefit = \App\Models\Benefit::where('id', $request->benefitID)
                    ->where('status', 'Active')
                    ->first();
                
                if ($benefit) {
                    // Check if benefit is for this member's barangay
                    $isEligible = false;
                    if ($benefit->selectedBarangays && is_array($benefit->selectedBarangays)) {
                        $isEligible = in_array($memberBarangay, $benefit->selectedBarangays);
                    } elseif ($benefit->barangay) {
                        $isEligible = ($benefit->barangay === 'All' || $benefit->barangay === $memberBarangay);
                    } else {
                        // No barangay restriction
                        $isEligible = true;
                    }
                    
                    if ($isEligible) {
                        $benefits[] = $benefit;
                    }
                }
            } else {
                // OPTIMIZED: Get all eligible active benefits in a single optimized query
                $benefits = \App\Models\Benefit::selectEssential()
                    ->active()
                    ->forBarangay($memberBarangay)
                    ->get();
            }

            if (empty($benefits)) {
                return response()->json([
                    'success' => false,
                    'error' => 'No active benefits found to claim'
                ], 404);
            }

            // OPTIMIZED: Get all existing claims for this user in a single query
            $benefitIds = collect($benefits)->pluck('id')->toArray();
            $existingClaims = BenefitClaim::selectEssential()
                ->where('pwdID', $member->userID)
                ->whereIn('benefitID', $benefitIds)
                ->get()
                ->keyBy('benefitID'); // Index by benefitID for fast lookup
            
            $claimsCreated = [];
            $duplicateErrors = [];
            $realTimeNow = now();
            
            // Prepare bulk insert data
            $bulkInsertData = [];
            
            foreach ($benefits as $benefit) {
                $benefitId = $benefit->id;
                $existingClaim = $existingClaims->get($benefitId);
                
                // Check if already claimed
                if ($existingClaim && $existingClaim->status === 'Claimed') {
                    \Illuminate\Support\Facades\Log::warning('Double disbursement attempt blocked', [
                        'member_id' => $member->userID,
                        'benefit_id' => $benefitId,
                        'existing_claim_id' => $existingClaim->id,
                        'existing_claim_date' => $existingClaim->claimDate,
                        'timestamp' => $realTimeNow->toDateTimeString()
                    ]);
                    
                    $duplicateErrors[] = [
                        'benefit_id' => $benefitId,
                        'benefit_title' => $benefit->title ?? $benefit->type ?? 'Benefit',
                        'message' => 'This benefit has already been claimed by this applicant',
                        'previous_claim_date' => $existingClaim->claimDate ? Carbon::parse($existingClaim->claimDate)->format('M d, Y H:i:s') : 'Unknown'
                    ];
                    continue;
                }
                
                if ($existingClaim) {
                    // Update existing unclaimed claim
                    if ($existingClaim->status !== 'Claimed') {
                        $existingClaim->update([
                            'status' => 'Claimed',
                            'claimDate' => $realTimeNow,
                            'claimantType' => $request->claimantType,
                            'claimantName' => $request->claimantName,
                            'claimantRelation' => $request->claimantRelation,
                            'authorizationLetter' => $authorizationLetterPath ?: $existingClaim->authorizationLetter,
                            'updated_at' => $realTimeNow
                        ]);
                        $claimsCreated[] = $existingClaim;
                    }
                } else {
                    // Prepare for bulk insert
                    $bulkInsertData[] = [
                        'pwdID' => $member->userID,
                        'benefitID' => $benefitId,
                        'claimDate' => $realTimeNow,
                        'status' => 'Claimed',
                        'claimantType' => $request->claimantType,
                        'claimantName' => $request->claimantName,
                        'claimantRelation' => $request->claimantRelation,
                        'authorizationLetter' => $authorizationLetterPath,
                        'created_at' => $realTimeNow,
                        'updated_at' => $realTimeNow
                    ];
                }
            }
            
            // Bulk insert new claims (much faster than individual inserts)
            if (!empty($bulkInsertData)) {
                BenefitClaim::insert($bulkInsertData);
                
                // Get the inserted claims
                $insertedClaims = BenefitClaim::selectEssential()
                    ->where('pwdID', $member->userID)
                    ->whereIn('benefitID', collect($bulkInsertData)->pluck('benefitID')->toArray())
                    ->where('status', 'Claimed')
                    ->where('claimDate', $realTimeNow)
                    ->get();
                
                $claimsCreated = array_merge($claimsCreated, $insertedClaims->all());
                
                \Illuminate\Support\Facades\Log::info('Benefit claims bulk created', [
                    'member_id' => $member->userID,
                    'claims_count' => count($insertedClaims),
                    'timestamp' => $realTimeNow->toDateTimeString()
                ]);
            }
            
            // Clear cache for this user's claims
            Cache::forget("benefit_claims:user:{$member->userID}");
            
            // If there were duplicate errors, include them in response
            if (!empty($duplicateErrors)) {
                \Illuminate\Support\Facades\Log::warning('Some benefits were not claimed due to duplicates', [
                    'member_id' => $member->userID,
                    'duplicates' => $duplicateErrors
                ]);
            }

            // Convert benefits to array format
            $benefitsArray = collect($benefits)->map(function($b) {
                return [
                    'id' => $b->id, // Benefit table only has 'id' column
                    'title' => $b->title ?? $b->type ?? 'Benefit',
                    'type' => $b->type ?? 'N/A',
                    'amount' => $b->amount ?? 0
                ];
            })->toArray();

            $response = [
                'success' => true,
                'benefitsClaimed' => count($claimsCreated),
                'benefits' => $benefitsArray,
                'member' => [
                    'userID' => $member->userID,
                    'firstName' => $member->firstName,
                    'lastName' => $member->lastName,
                    'pwd_id' => $member->pwd_id
                ],
                'claimantType' => $request->claimantType,
                'claimantName' => $request->claimantName,
                'claimantRelation' => $request->claimantRelation,
                'claim_timestamp' => now()->format('Y-m-d H:i:s')
            ];

            // Include duplicate errors if any
            if (!empty($duplicateErrors)) {
                $response['duplicate_errors'] = $duplicateErrors;
                $response['warning'] = count($duplicateErrors) . ' benefit(s) were not claimed due to duplicate disbursement prevention.';
            }

            return response()->json($response);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('QR scan claim benefits error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to claim benefits: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download treasury letter for late claim
     */
    public function downloadTreasuryLetter($id)
    {
        try {
            $claim = BenefitClaim::with('pwdMember', 'benefit')->find($id);
            
            if (!$claim) {
                return response()->json(['message' => 'Benefit claim not found'], 404);
            }

            // Check if DomPDF is available
            if (class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('benefits.treasury_letter', [
                    'claim' => $claim,
                    'member' => $claim->pwdMember,
                    'benefit' => $claim->benefit,
                    'date' => now()->format('F d, Y')
                ]);
                return $pdf->download('Treasury_Letter_' . ($claim->benefit->title ?? $claim->benefit->type) . '_' . $id . '.pdf');
            } else {
                // Fallback: Return HTML view that can be printed
                return view('benefits.treasury_letter', [
                    'claim' => $claim,
                    'member' => $claim->pwdMember,
                    'benefit' => $claim->benefit,
                    'date' => now()->format('F d, Y')
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Error generating treasury letter: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate treasury letter: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload signed treasury letter for late claim
     */
    public function uploadSignedLetter(Request $request, $id)
    {
        try {
            $claim = BenefitClaim::find($id);
            
            if (!$claim) {
                return response()->json(['message' => 'Benefit claim not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'signed_letter' => 'required|file|image|mimes:jpeg,jpg,png|max:10240',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 400);
            }

            // Store the signed letter
            $file = $request->file('signed_letter');
            $fileName = 'signed_treasury_letter_' . time() . '_' . $claim->id . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('signed_treasury_letters', $fileName, 'public');

            // Update claim with signed letter path
            $claim->update([
                'signedTreasuryLetter' => $filePath,
                'status' => 'Pending Approval' // Change status to pending approval
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Signed letter uploaded successfully. Your claim is pending approval.',
                'claim' => $claim->load('pwdMember', 'benefit')
            ]);
        } catch (\Exception $e) {
            \Log::error('Error uploading signed letter: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to upload signed letter'], 500);
        }
    }
}