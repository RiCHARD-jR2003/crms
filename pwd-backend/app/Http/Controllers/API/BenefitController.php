<?php
// app/Http/Controllers/API/BenefitController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Benefit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class BenefitController extends Controller
{
    public function index(Request $request)
    {
        // Build cache key based on request parameters
        $barangay = $request->get('barangay');
        $status = $request->get('status', 'Active');
        $cacheKey = "benefits:index:{$status}:" . ($barangay ?: 'all');
        
        // Cache for 5 minutes (300 seconds) - frequently accessed data
        $benefits = Cache::remember($cacheKey, 300, function() use ($request, $status) {
            $query = Benefit::selectEssential()
                ->where('status', $status)
                ->recentFirst();
            
            // Filter by barangay if provided (for PWD members)
            if ($request->has('barangay') && $request->barangay) {
                $query->forBarangay($request->barangay);
            }
            
            // Limit results for performance (pagination can be added if needed)
            return $query->limit(1000)->get();
        });
        
        // Format timestamps efficiently (only transform what's needed)
        $benefits->transform(function($benefit) {
            // Use Carbon's built-in casting - already handled by model casts
            // Just ensure proper format for API response
            return $benefit;
        });
        
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
            'selectedBarangays' => 'required|array|min:1',
            'selectedBarangays.*' => 'required|string|max:100',
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

        // Validate selectedBarangays - ensure no empty or invalid entries
        $selectedBarangays = $request->selectedBarangays;
        if (is_array($selectedBarangays)) {
            $selectedBarangays = array_filter($selectedBarangays, function($barangay) {
                return !empty($barangay) && is_string($barangay) && trim($barangay) !== '';
            });
            
            if (empty($selectedBarangays)) {
                return response()->json([
                    'selectedBarangays' => ['At least one valid barangay must be selected.']
                ], 400);
            }
            
            // Remove duplicates
            $selectedBarangays = array_unique($selectedBarangays);
        }

        // Use real-time timestamp
        $benefitData = $request->all();
        $benefitData['selectedBarangays'] = array_values($selectedBarangays);
        $benefitData['created_at'] = now();
        $benefitData['updated_at'] = now();
        
        // Set status to Active by default if not provided
        if (!isset($benefitData['status'])) {
            $benefitData['status'] = 'Active';
        }

        $benefit = Benefit::create($benefitData);

        // Clear relevant caches
        Cache::forget("benefits:index:Active:all");
        Cache::forget("benefits:index:Active:{$benefit->barangay}");
        if ($benefit->selectedBarangays) {
            foreach ($benefit->selectedBarangays as $barangay) {
                Cache::forget("benefits:index:Active:{$barangay}");
            }
        }

        Log::info('Benefit created', [
            'benefit_id' => $benefit->id,
            'title' => $benefit->title,
            'selectedBarangays' => $benefit->selectedBarangays,
            'created_at' => $benefit->created_at->toDateTimeString()
        ]);

        return response()->json($benefit, 201);
    }

    public function show($id)
    {
        // Cache individual benefit for 10 minutes
        $cacheKey = "benefit:show:{$id}";
        
        $benefit = Cache::remember($cacheKey, 600, function() use ($id) {
            return Benefit::selectEssential()->find($id);
        });
        
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

        // Clear relevant caches
        Cache::forget("benefit:show:{$id}");
        Cache::forget("benefits:index:Active:all");
        Cache::forget("benefits:index:Active:{$benefit->barangay}");
        if ($benefit->selectedBarangays) {
            foreach ($benefit->selectedBarangays as $barangay) {
                Cache::forget("benefits:index:Active:{$barangay}");
            }
        }

        return response()->json($benefit);
    }

    public function destroy($id)
    {
        $benefit = Benefit::find($id);
        
        if (!$benefit) {
            return response()->json(['message' => 'Benefit not found'], 404);
        }

        $barangay = $benefit->barangay;
        $selectedBarangays = $benefit->selectedBarangays ?? [];
        
        $benefit->delete();

        // Clear relevant caches
        Cache::forget("benefit:show:{$id}");
        Cache::forget("benefits:index:Active:all");
        Cache::forget("benefits:index:Active:{$barangay}");
        foreach ($selectedBarangays as $barangay) {
            Cache::forget("benefits:index:Active:{$barangay}");
        }

        return response()->json(['message' => 'Benefit deleted successfully']);
    }

    /**
     * Announce benefit to selected barangays (Barangay President feature)
     */
    public function announceBenefit(Request $request, $id)
    {
        $benefit = Benefit::find($id);
        
        if (!$benefit) {
            return response()->json(['message' => 'Benefit not found'], 404);
        }

        if ($benefit->status !== 'Active') {
            return response()->json(['message' => 'Only active benefits can be announced'], 400);
        }

        try {
            $notificationService = app(\App\Services\NotificationService::class);
            $selectedBarangays = $benefit->selectedBarangays ?? [];
            
            if (empty($selectedBarangays)) {
                return response()->json(['message' => 'No barangays selected for this benefit'], 400);
            }

            // Get all PWD members from selected barangays - optimized query
            $members = \App\Models\PWDMember::whereIn('barangay', $selectedBarangays)
                ->where('status', 'Active')
                ->select(['userID', 'barangay', 'firstName', 'lastName', 'status'])
                ->with(['user' => function($query) {
                    $query->select(['userID', 'email', 'firstName', 'lastName']);
                }])
                ->get();

            $notificationsSent = 0;
            $announcementTime = now();

            foreach ($members as $member) {
                if ($member->user) {
                    $notificationService::create(
                        $member->user->userID,
                        'benefit_announcement',
                        'New Benefit Available',
                        "A new benefit '{$benefit->title}' ({$benefit->amount}) is now available for claiming. Distribution Date: " . Carbon::parse($benefit->distributionDate)->format('M d, Y'),
                        [
                            'benefit_id' => $benefit->id,
                            'benefit_title' => $benefit->title,
                            'benefit_amount' => $benefit->amount,
                            'distribution_date' => $benefit->distributionDate,
                            'expiry_date' => $benefit->expiryDate,
                            'announced_at' => $announcementTime->toDateTimeString()
                        ]
                    );
                    $notificationsSent++;
                }
            }

            // Update benefit with announcement timestamp
            $benefit->update([
                'announced_at' => $announcementTime,
                'updated_at' => $announcementTime
            ]);

            Log::info('Benefit announced', [
                'benefit_id' => $benefit->id,
                'barangays' => $selectedBarangays,
                'notifications_sent' => $notificationsSent,
                'announced_at' => $announcementTime->toDateTimeString()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Benefit announced successfully to {$notificationsSent} qualified applicants",
                'notifications_sent' => $notificationsSent,
                'announced_at' => $announcementTime->format('Y-m-d H:i:s')
            ]);

        } catch (\Exception $e) {
            Log::error('Error announcing benefit', [
                'benefit_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to announce benefit: ' . $e->getMessage()
            ], 500);
        }
    }
}