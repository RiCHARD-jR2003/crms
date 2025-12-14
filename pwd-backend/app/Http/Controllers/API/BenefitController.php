<?php
// app/Http/Controllers/API/BenefitController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Benefit;
use App\Models\Announcement;
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
        
        // NOTE: caching was causing delays in showing newly approved benefits.
        // We disable caching here for freshness.
            try {
                // Use selectEssential for performance, but ensure we get all necessary fields
                $query = Benefit::selectEssential();
                
                // Filter by status (default to Active if not specified)
            if ($status && $status !== 'all') {
                $query->where('status', $status);
            }
                
            Log::info('Fetching benefits (no cache)', [
                    'status_filter' => $status,
                    'barangay_filter' => $request->get('barangay')
                ]);
                
                // Use simple ordering to avoid any issues with COALESCE
                $query->orderBy('created_at', 'desc');
                
                // Filter by barangay if provided (for PWD members)
                if ($request->has('barangay') && $request->barangay) {
                    $query->forBarangay($request->barangay);
                }
                
                // Limit results for performance (pagination can be added if needed)
            $benefits = $query->limit(1000)->get();
                
            Log::info('Benefits fetched successfully (no cache)', [
                'count' => $benefits->count(),
                    'status_filter' => $status,
                'first_benefit_id' => $benefits->first() ? $benefits->first()->id : null,
                'first_benefit_status' => $benefits->first() ? $benefits->first()->status : null
                ]);
            } catch (\Exception $e) {
                Log::error('Error fetching benefits: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'status_filter' => $status
                ]);
            $benefits = collect([]);
            }
        
        // Convert to array and handle selectedBarangays
        // Use map instead of transform to avoid modifying cached collection
        try {
            $benefitsArray = $benefits->map(function($benefit) {
                $benefitArray = $benefit->toArray();
                
                // Ensure selectedBarangays is an array (should already be cast by model, but handle edge cases)
                if (isset($benefitArray['selectedBarangays']) && is_string($benefitArray['selectedBarangays'])) {
                    try {
                        $decoded = json_decode($benefitArray['selectedBarangays'], true);
                        $benefitArray['selectedBarangays'] = is_array($decoded) ? $decoded : [];
                    } catch (\Exception $e) {
                        $benefitArray['selectedBarangays'] = [];
                    }
                } elseif (!isset($benefitArray['selectedBarangays']) || !is_array($benefitArray['selectedBarangays'])) {
                    $benefitArray['selectedBarangays'] = [];
                }
                
                return $benefitArray;
            })->values()->all();
        } catch (\Exception $e) {
            Log::error('Error processing benefits array: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            // Fallback: return empty array
            $benefitsArray = [];
        }
        
        Log::info('Benefits response prepared', [
            'total_count' => count($benefitsArray),
            'status_filter' => $status
        ]);
        
        try {
            return response()->json($benefitsArray);
        } catch (\Exception $e) {
            Log::error('Error encoding benefits to JSON: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch benefits',
                'error' => $e->getMessage()
            ], 500);
        }
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
            'distributionDate' => 'required|date|after:+6 days', // At least 1 week from today
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

        $draftAnnouncementCreated = false;
        // Always create draft announcement when benefit is created (regardless of status)
        // This ensures barangay presidents can see and announce benefits
            try {
                // Check if announcement already exists for this benefit
                $existingAnnouncement = Announcement::where('benefitID', $benefit->id)->first();
                if (!$existingAnnouncement) {
                $announcement = $this->createDraftAnnouncementForBenefit($benefit, $request->user());
                    $draftAnnouncementCreated = true;
                
                Log::info('Draft announcement created for benefit', [
                    'benefit_id' => $benefit->id,
                    'announcement_id' => $announcement->announcementID,
                    'target_audience' => $announcement->targetAudience,
                    'status' => $announcement->status
                ]);
                
                // Clear announcement cache for the target audience to ensure it appears immediately
                $announcementController = app(\App\Http\Controllers\API\AnnouncementController::class);
                $reflection = new \ReflectionClass($announcementController);
                $clearCacheMethod = $reflection->getMethod('clearAnnouncementCache');
                $clearCacheMethod->setAccessible(true);
                $clearCacheMethod->invoke($announcementController, $announcement->targetAudience);
                }
            } catch (\Exception $e) {
                Log::error('Failed to create draft announcement for benefit: ' . $e->getMessage(), [
                    'benefit_id' => $benefit->id,
                    'trace' => $e->getTraceAsString()
                ]);
                // Don't fail the benefit creation if announcement creation fails
            }

        // Notify Barangay Presidents for each barangay in selectedBarangays
        try {
            $barangaysToNotify = [];
            
            // Collect barangays from selectedBarangays
            if ($benefit->selectedBarangays && is_array($benefit->selectedBarangays)) {
                $barangaysToNotify = array_merge($barangaysToNotify, $benefit->selectedBarangays);
            }
            
            // Also include single barangay if set
            if ($benefit->barangay && $benefit->barangay !== 'All' && $benefit->barangay !== 'All Barangays') {
                if (!in_array($benefit->barangay, $barangaysToNotify)) {
                    $barangaysToNotify[] = $benefit->barangay;
                }
            }
            
            // Remove duplicates
            $barangaysToNotify = array_unique($barangaysToNotify);
            
            // Notify each barangay president
            $notificationService = app(\App\Services\NotificationService::class);
            $notifiedPresidents = [];
            
            foreach ($barangaysToNotify as $barangay) {
                $barangayPresidents = \App\Models\BarangayPresident::where('barangay', $barangay)
                    ->pluck('userID')
                    ->toArray();
                
                foreach ($barangayPresidents as $presidentUserId) {
                    if (!in_array($presidentUserId, $notifiedPresidents)) {
                        $distributionDate = $benefit->distributionDate 
                            ? Carbon::parse($benefit->distributionDate)->format('M d, Y')
                            : 'To be announced';
                        
                        $notificationService::create(
                            $presidentUserId,
                            'benefit_created',
                            'New Benefit Available for Your Barangay',
                            "A new benefit '{$benefit->title}' ({$benefit->amount}) has been added for {$barangay}. Distribution Date: {$distributionDate}. Please review and announce this benefit to your barangay members.",
                            [
                                'benefit_id' => $benefit->id,
                                'benefit_title' => $benefit->title,
                                'benefit_type' => $benefit->type,
                                'benefit_amount' => $benefit->amount,
                                'barangay' => $barangay,
                                'distribution_date' => $benefit->distributionDate,
                                'expiry_date' => $benefit->expiryDate,
                                'created_at' => $benefit->created_at->toDateTimeString(),
                                'action_required' => 'announce'
                            ],
                            false // Don't notify SuperAdmin about this notification
                        );
                        
                        $notifiedPresidents[] = $presidentUserId;
                    }
                }
            }
            
            Log::info('Barangay Presidents notified about new benefit', [
                'benefit_id' => $benefit->id,
                'barangays' => $barangaysToNotify,
                'presidents_notified' => count($notifiedPresidents)
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to notify barangay presidents about new benefit', [
                'benefit_id' => $benefit->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            // Don't fail benefit creation if notification fails
        }

        // Clear ALL relevant caches (for all statuses, not just Active)
        // Clear cache for all statuses to ensure new benefits appear regardless of status
        $statuses = ['Active', 'Pending', 'Inactive', 'Draft', 'all'];
        foreach ($statuses as $status) {
            Cache::forget("benefits:index:{$status}:all");
            if ($benefit->barangay) {
                Cache::forget("benefits:index:{$status}:{$benefit->barangay}");
            }
            if ($benefit->selectedBarangays && is_array($benefit->selectedBarangays)) {
            foreach ($benefit->selectedBarangays as $barangay) {
                    Cache::forget("benefits:index:{$status}:{$barangay}");
            }
        }
        }
        
        // Also clear the simple benefits route cache if it exists
        Cache::forget('benefits-simple');
        
        // Clear cache for 'all' status specifically (used when fetching all benefits)
        Cache::forget("benefits:index:all:all");

        Log::info('Benefit created', [
            'benefit_id' => $benefit->id,
            'title' => $benefit->title,
            'selectedBarangays' => $benefit->selectedBarangays,
            'created_at' => $benefit->created_at->toDateTimeString(),
            'draft_announcement_created' => $draftAnnouncementCreated
        ]);

        return response()->json([
            'success' => true,
            'data' => $benefit,
            'draft_announcement_created' => $draftAnnouncementCreated
        ], 201);
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

            // Find or create announcement for this benefit
            $announcement = Announcement::where('benefitID', $benefit->id)->first();
            
            if (!$announcement) {
                // Create announcement if it doesn't exist
                $announcement = $this->createDraftAnnouncementForBenefit($benefit, $request->user());
                Log::info('Created announcement for benefit when announcing', [
                    'benefit_id' => $benefit->id,
                    'announcement_id' => $announcement->announcementID
                ]);
            }
            
            // Ensure announcement is Active and targetAudience includes all selected barangays and "Members"
            $targetAudienceArray = array_map('trim', explode(',', $announcement->targetAudience ?? ''));
            
            // Add all selected barangays to targetAudience
            foreach ($selectedBarangays as $barangay) {
                $barangayFound = false;
                foreach ($targetAudienceArray as $ta) {
                    if (strcasecmp(trim($ta), $barangay) === 0) {
                        $barangayFound = true;
                        break;
                    }
                }
                if (!$barangayFound) {
                    $targetAudienceArray[] = $barangay;
                }
            }
            
            // Add "Members" if not present
            $membersFound = false;
            foreach ($targetAudienceArray as $ta) {
                if (strcasecmp(trim($ta), 'Members') === 0) {
                    $membersFound = true;
                    break;
                }
            }
            if (!$membersFound) {
                $targetAudienceArray[] = 'Members';
            }
            
            // Update announcement to Active status and set targetAudience
            $announcement->status = 'Active';
            $announcement->targetAudience = implode(', ', array_unique($targetAudienceArray));
            // Set publishDate to current datetime to ensure it appears at the top of the list
            // Use toDateTimeString() to include time component for proper sorting
            $announcement->publishDate = now()->toDateTimeString();
            $announcement->save();
            
            Log::info('Updated announcement when benefit announced', [
                'announcement_id' => $announcement->announcementID,
                'benefit_id' => $benefit->id,
                'target_audience' => $announcement->targetAudience,
                'status' => $announcement->status
            ]);
            
            // CRITICAL: Clear all announcement caches to ensure PWD members see the announcement immediately
            $announcementController = app(\App\Http\Controllers\API\AnnouncementController::class);
            $reflection = new \ReflectionClass($announcementController);
            $clearCacheMethod = $reflection->getMethod('clearAnnouncementCache');
            $clearCacheMethod->setAccessible(true);
            
            // Clear cache for each barangay
            foreach ($selectedBarangays as $barangay) {
                $clearCacheMethod->invoke($announcementController, $barangay);
            }
            
            // Clear cache for "Members" (so all PWD members see it)
            $clearCacheMethod->invoke($announcementController, 'Members');
            
            // Clear cache for the updated targetAudience
            $clearCacheMethod->invoke($announcementController, $announcement->targetAudience);
            
            // Also clear general caches
            Cache::forget('announcements.all');
            Cache::forget('announcements.admin');
            Cache::forget('announcements.Members');
            Cache::forget('announcements.All');
            Cache::forget('announcements.All Barangays');

            // Get all PWD members from selected barangays - optimized query
            $members = \App\Models\PWDMember::whereIn('barangay', $selectedBarangays)
                ->where('status', 'Active')
                ->select(['userID', 'barangay', 'firstName', 'lastName', 'status'])
                ->with(['user' => function($query) {
                    $query->select(['userID', 'email']); // Only select columns that exist in users table
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
                            'announcement_id' => $announcement->announcementID,
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
            
            // CRITICAL: Clear ALL announcement caches to ensure PWD members see the announcement immediately
            $announcementController = app(\App\Http\Controllers\API\AnnouncementController::class);
            $reflection = new \ReflectionClass($announcementController);
            $clearCacheMethod = $reflection->getMethod('clearAnnouncementCache');
            $clearCacheMethod->setAccessible(true);
            
            // Clear cache for the updated targetAudience (which includes barangays and "Members")
            $clearCacheMethod->invoke($announcementController, $announcement->targetAudience);
            
            // Clear cache for each barangay individually (both regular and BP cache)
            foreach ($selectedBarangays as $barangay) {
                $clearCacheMethod->invoke($announcementController, $barangay);
                Cache::forget('announcements.' . $barangay);
                Cache::forget('announcements.' . $barangay . '.bp');
            }
            
            // Clear cache for "Members" (critical - ensures all PWD members see it)
            $clearCacheMethod->invoke($announcementController, 'Members');
            Cache::forget('announcements.Members');
            
            // Clear general caches
            Cache::forget('announcements.All');
            Cache::forget('announcements.All Barangays');
            Cache::forget('announcements.all');
            Cache::forget('announcements.admin');
            
            Log::info('Cleared announcement caches after benefit announcement', [
                'barangays' => $selectedBarangays,
                'target_audience' => $announcement->targetAudience
            ]);

            Log::info('Benefit announced', [
                'benefit_id' => $benefit->id,
                'announcement_id' => $announcement->announcementID,
                'barangays' => $selectedBarangays,
                'notifications_sent' => $notificationsSent,
                'announced_at' => $announcementTime->toDateTimeString()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Benefit announced successfully to {$notificationsSent} qualified applicants",
                'notifications_sent' => $notificationsSent,
                'announcement_id' => $announcement->announcementID,
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

    /**
     * Create a draft announcement for an approved benefit
     * Uses a standardized template with all required information pre-filled
     */
    private function createDraftAnnouncementForBenefit($benefit, $user = null)
    {
        $authorID = $user ? $user->userID : 1;
        
        // Determine target audience based on selected barangays
        $selectedBarangays = [];
        $targetAudience = 'All Barangays';
        if ($benefit->selectedBarangays && is_array($benefit->selectedBarangays) && count($benefit->selectedBarangays) > 0) {
            $selectedBarangays = $benefit->selectedBarangays;
            $targetAudience = implode(', ', $selectedBarangays);
        } elseif ($benefit->barangay && $benefit->barangay !== 'All') {
            $selectedBarangays = [$benefit->barangay];
            $targetAudience = $benefit->barangay;
        }
        
        // Build announcement title using standardized format
        $title = $this->generateAnnouncementTitle($benefit, $selectedBarangays);
        
        // Format dates
        $distributionDate = $benefit->distributionDate ? Carbon::parse($benefit->distributionDate) : null;
        $expiryDate = $benefit->expiryDate ? Carbon::parse($benefit->expiryDate) : null;
        
        // Generate pre-filled description
        $description = $this->generateAnnouncementDescription($benefit, $selectedBarangays, $distributionDate, $expiryDate);
        
        // Create draft announcement with standardized template
        $announcement = Announcement::create([
            'authorID' => $authorID,
            'benefitID' => $benefit->id,
            'title' => $title,
            'content' => $description,
            'type' => 'Event',
            'category' => 'Ayuda Program',
            'priority' => 'High',
            'targetAudience' => $targetAudience,
            'status' => 'Draft', // Always created as Draft for admin review
            'publishDate' => now()->toDateString(), // Auto-suggested as current date (editable)
            'expiryDate' => $expiryDate ? $expiryDate->toDateString() : null, // Auto-suggested based on benefit validity (editable)
            'views' => 0
        ]);
        
        return $announcement;
    }

    /**
     * Generate standardized announcement title based on benefit type
     */
    private function generateAnnouncementTitle($benefit, $selectedBarangays)
    {
        $benefitType = $benefit->type ?? 'Financial Assistance';
        $barangaysText = count($selectedBarangays) > 0 
            ? implode(', ', $selectedBarangays) 
            : 'All Barangays';
        
        // Check if it's a Birthday Cash Gift (has quarter or birthdayMonth)
        if ($benefit->quarter || $benefit->birthdayMonth) {
            $quarter = $benefit->quarter ?? '';
            if ($quarter) {
                // Format: "1st Quarter Birthday Cash Gift for (Barangays)"
                $quarterOrdinal = $this->getOrdinalNumber($quarter);
                return "{$quarterOrdinal} Quarter Birthday Cash Gift for {$barangaysText}";
            } elseif ($benefit->birthdayMonth) {
                // Format: "(Month) Birthday Cash Gift for (Barangays)"
                try {
                    $monthNumber = is_numeric($benefit->birthdayMonth) ? (int)$benefit->birthdayMonth : null;
                    if ($monthNumber && $monthNumber >= 1 && $monthNumber <= 12) {
                        $monthName = Carbon::create()->month($monthNumber)->format('F');
                        return "{$monthName} Birthday Cash Gift for {$barangaysText}";
                    } else {
                        // If it's already a month name, use it directly
                        return "{$benefit->birthdayMonth} Birthday Cash Gift for {$barangaysText}";
                    }
                } catch (\Exception $e) {
                    // Fallback: use the value directly
                    return "{$benefit->birthdayMonth} Birthday Cash Gift for {$barangaysText}";
                }
            }
        }
        
        // Check if it's Financial Assistance
        if (stripos($benefitType, 'Financial Assistance') !== false || 
            stripos($benefitType, 'Financial') !== false) {
            $currentMonth = now()->format('F');
            return "{$currentMonth} Financial Assistance for {$barangaysText}";
        }
        
        // For other types, use: "(Type) for (Barangays)"
        return "{$benefitType} for {$barangaysText}";
    }

    /**
     * Get ordinal number (1st, 2nd, 3rd, 4th)
     */
    private function getOrdinalNumber($number)
    {
        $number = (int)$number;
        $ends = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
        if ((($number % 100) >= 11) && (($number % 100) <= 13)) {
            return $number . 'th';
        }
        return $number . ($ends[$number % 10] ?? 'th');
    }

    /**
     * Generate pre-filled announcement description
     */
    private function generateAnnouncementDescription($benefit, $selectedBarangays, $distributionDate, $expiryDate)
    {
        $benefitType = $benefit->type ?? 'Financial Assistance';
        $amount = $benefit->amount ?? '0.00';
        $benefitDescription = $benefit->description ?? '';
        
        // Build description
        $description = "A new Ayuda (Benefit) program has been approved and is now available for claiming.\n\n";
        
        // Program Summary
        $description .= "PROGRAM SUMMARY:\n";
        $description .= "This announcement is for the approved {$benefitType} program";
        if (count($selectedBarangays) > 0) {
            $description .= " targeting the following barangay(s): " . implode(', ', $selectedBarangays);
        }
        $description .= ".\n\n";
        
        // Program Details
        $description .= "PROGRAM DETAILS:\n";
        $description .= "• Benefit Type: {$benefitType}\n";
        $description .= "• Amount: ₱{$amount}\n";
        if ($benefitDescription) {
            $description .= "• Description: {$benefitDescription}\n";
        }
        $description .= "\n";
        
        // Eligibility
        $description .= "ELIGIBILITY:\n";
        $description .= "• Must be a registered PWD member\n";
        $description .= "• Must have completed all required documents\n";
        $description .= "\n";
        
        // Important Dates
        $description .= "IMPORTANT DATES:\n";
        if ($distributionDate) {
            $description .= "• Distribution Date: " . $distributionDate->format('F d, Y') . "\n";
        } else {
            $description .= "• Distribution Date: [TO BE SPECIFIED]\n";
        }
        if ($expiryDate) {
            $description .= "• Claim Deadline: " . $expiryDate->format('F d, Y') . "\n";
        } else {
            $description .= "• Claim Deadline: [TO BE SPECIFIED]\n";
        }
        $description .= "\n";
        
        // Claiming Instructions
        $description .= "CLAIMING INSTRUCTIONS:\n";
        $description .= "1. Visit your barangay hall or the designated claiming venue\n";
        $description .= "2. Present valid ID and PWD card for verification\n";
        $description .= "3. Wait for verification and approval\n";
        $description .= "4. Receive your benefit upon approval\n";
        $description .= "\n";
        
        // Venue (editable - left as placeholder)
        $description .= "VENUE:\n";
        $description .= "• Location: [TO BE SPECIFIED - Venue will be finalized through coordination with Barangay President, PDO Head, and Mayor]\n";
        $description .= "• PDAO Office Hours: 8am-4pm\n";
        $description .= "\n";
        
        // Contact Information
        $description .= "CONTACT INFORMATION:\n";
        $description .= "• For questions or concerns, please contact your barangay office\n";
        $description .= "• Office: [TO BE SPECIFIED]\n";
        $description .= "• Phone: [TO BE SPECIFIED]\n";
        $description .= "• Email: [TO BE SPECIFIED]\n";
        $description .= "\n";
        
        // Important Reminders
        $description .= "IMPORTANT REMINDERS:\n";
        $description .= "• Please bring all required documents when claiming (Valid ID, PWD Card)\n";
        $description .= "• Benefits must be claimed before the specified deadline\n";
        $description .= "• Only eligible members will receive the benefit\n";
        $description .= "• For any issues or concerns, contact your barangay office immediately\n";
        $description .= "\n";
        
        $description .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $description .= "Note: This is a draft announcement. Please complete all [TO BE SPECIFIED] fields, especially the venue details, before posting.\n";
        
        return $description;
    }

    /**
     * Post a draft announcement (change status from Draft to Active)
     */
    public function postAnnouncement(Request $request, $id)
    {
        $announcement = Announcement::find($id);
        
        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        if ($announcement->status !== 'Draft') {
            return response()->json(['message' => 'Only draft announcements can be posted'], 400);
        }

        // Validate required fields are complete (comprehensive check)
        $requiredFields = [
            'title' => 'Title',
            'content' => 'Full Description/Details',
            'type' => 'Announcement Type',
            'priority' => 'Priority Level',
            'targetAudience' => 'Targeted Barangays',
            'publishDate' => 'Date & Time of Announcement'
        ];
        
        $missingFields = [];
        foreach ($requiredFields as $field => $label) {
            if (empty($announcement->$field)) {
                $missingFields[] = $label;
            }
        }
        
        // Additional validation: Check if content contains placeholder text
        if (strpos($announcement->content, '[TO BE SPECIFIED]') !== false) {
            $missingFields[] = 'Complete all announcement details (remove all [TO BE SPECIFIED] placeholders)';
        }
        
        // Check if benefitID is set (for Ayuda-related announcements)
        if ($announcement->category === 'Ayuda Program' && empty($announcement->benefitID)) {
            $missingFields[] = 'Related Program/Ayuda';
        }

        if (!empty($missingFields)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot post announcement. Missing required fields: ' . implode(', ', $missingFields),
                'missing_fields' => $missingFields
            ], 400);
        }

        // Update status to Active
        $announcement->status = 'Active';
        $announcement->publishDate = $announcement->publishDate ?: now()->toDateString();
        $announcement->save();

        // Clear cache for all affected barangays
        Cache::forget('announcements.all');
        Cache::forget('announcements.admin');
        
        // Clear cache for the target audience (both regular and barangay president cache)
        Cache::forget('announcements.' . $announcement->targetAudience);
        Cache::forget('announcements.' . $announcement->targetAudience . '.bp');
        
        // If targetAudience is comma-separated, clear cache for each barangay
        if (strpos($announcement->targetAudience, ',') !== false) {
            $barangays = array_map('trim', explode(',', $announcement->targetAudience));
            foreach ($barangays as $barangay) {
                Cache::forget('announcements.' . $barangay);
                Cache::forget('announcements.' . $barangay . '.bp');
            }
        }
        
        // Also clear general caches
        Cache::forget('announcements.Members');
        Cache::forget('announcements.All');
        Cache::forget('announcements.All Barangays');

        return response()->json([
            'success' => true,
            'message' => 'Announcement posted successfully',
            'data' => $announcement
        ]);
    }

    /**
     * Barangay President: Announce to all registered members in their barangay
     */
    public function announceToMembers(Request $request, $id)
    {
        $announcement = Announcement::with('benefit')->find($id);
        
        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        if ($announcement->status !== 'Active') {
            return response()->json(['message' => 'Only active announcements can be announced to members'], 400);
        }

        $user = $request->user();
        if (!$user || !in_array($user->role, ['BarangayPresident', 'Admin', 'SuperAdmin'])) {
            return response()->json(['message' => 'Unauthorized. Only Barangay Presidents can announce to members'], 403);
        }

        // Get barangay from the barangayPresident relationship for BarangayPresident role
        $barangay = null;
        if ($user->role === 'BarangayPresident') {
            $barangayPresident = $user->barangayPresident;
            $barangay = $barangayPresident ? $barangayPresident->barangay : null;
        } elseif (in_array($user->role, ['Admin', 'SuperAdmin'])) {
            // For Admin/SuperAdmin, get barangay from the announcement's targetAudience
            $barangay = $announcement->targetAudience;
        }
        
        if (!$barangay) {
            return response()->json(['message' => 'Barangay not found for user'], 400);
        }

        // Verify announcement is for this barangay (or is for all members/barangays)
        $benefit = $announcement->benefit;
        $isForThisBarangay = false;
        $targetAudience = $announcement->targetAudience ?? '';
        
        // Check if it's a global announcement (All, All Barangays, Members)
        if (in_array($targetAudience, ['All', 'All Barangays', 'Members'])) {
            $isForThisBarangay = true;
        } elseif (strpos($targetAudience, 'Members') !== false || strpos($targetAudience, 'All') !== false) {
            // Comma-separated list contains Members or All
            $isForThisBarangay = true;
        } elseif ($benefit) {
            $selectedBarangays = $benefit->selectedBarangays ?? [];
            if (!empty($selectedBarangays) && is_array($selectedBarangays)) {
                $isForThisBarangay = in_array($barangay, $selectedBarangays);
            } else {
                // Check targetAudience if selectedBarangays is empty
                if ($targetAudience === $barangay) {
                    $isForThisBarangay = true;
                } else {
                    // Check if barangay is in comma-separated list
                    $barangays = array_map('trim', explode(',', $targetAudience));
                    $isForThisBarangay = in_array($barangay, $barangays);
                }
            }
        } else {
            // No benefit attached, just check targetAudience
            if ($targetAudience === $barangay) {
                $isForThisBarangay = true;
            } else {
                // Check if barangay is in comma-separated list
                $barangays = array_map('trim', explode(',', $targetAudience));
                $isForThisBarangay = in_array($barangay, $barangays);
            }
        }
        
        if (!$isForThisBarangay) {
            return response()->json(['message' => 'This announcement is not for your barangay'], 403);
        }

        try {
            // CRITICAL: Update announcement FIRST before sending notifications
            // This ensures the announcement appears in the PWD member dashboard
            $originalTargetAudience = $announcement->targetAudience;
            $originalStatus = $announcement->status;
            $targetAudienceArray = array_map('trim', explode(',', $announcement->targetAudience ?? ''));
            $needsUpdate = false;
            
            // Check if barangay is already in the list (case-insensitive)
            $barangayFound = false;
            foreach ($targetAudienceArray as $ta) {
                if (strcasecmp(trim($ta), $barangay) === 0) {
                    $barangayFound = true;
                    break;
                }
            }
            
            // Check if "Members" is in the list (case-insensitive)
            $membersFound = false;
            foreach ($targetAudienceArray as $ta) {
                if (strcasecmp(trim($ta), 'Members') === 0) {
                    $membersFound = true;
                    break;
                }
            }
            
            // Add barangay if not found
            if (!$barangayFound) {
                $targetAudienceArray[] = $barangay;
                $needsUpdate = true;
            }
            
            // Add "Members" if not found (so PWD members can see it)
            if (!$membersFound) {
                $targetAudienceArray[] = 'Members';
                $needsUpdate = true;
            }
            
            // Update announcement if needed
            if ($needsUpdate || $announcement->status !== 'Active') {
                // Ensure targetAudience includes both barangay and "Members" for PWD member visibility
                $finalTargetAudience = array_unique($targetAudienceArray);
                $announcement->targetAudience = implode(', ', $finalTargetAudience);
                $announcement->status = 'Active';
                // Set publishDate to current datetime to ensure it appears at the top of the list
                $announcement->publishDate = now()->toDateTimeString();
                $announcement->save();
                
                // Refresh the announcement to ensure changes are persisted
                $announcement->refresh();
                
                Log::info('Updated announcement when announcing to members', [
                    'announcement_id' => $announcement->announcementID,
                    'announcement_title' => $announcement->title,
                    'barangay' => $barangay,
                    'original_target_audience' => $originalTargetAudience,
                    'new_target_audience' => $announcement->targetAudience,
                    'original_status' => $originalStatus,
                    'new_status' => $announcement->status
                ]);
            }
            
            // Clear cache BEFORE sending notifications to ensure fresh data
            Cache::forget('announcements.' . $barangay);
            Cache::forget('announcements.' . $barangay . '.bp');
            Cache::forget('announcements.All Barangays');
            Cache::forget('announcements.All Barangays.bp');
            Cache::forget('announcements.all');
            Cache::forget('announcements.admin');
            Cache::forget('announcements.Members');
            Cache::forget('announcements.All');
            
            // Clear cache for original and updated targetAudience
            if ($originalTargetAudience) {
                Cache::forget('announcements.' . $originalTargetAudience);
                Cache::forget('announcements.' . $originalTargetAudience . '.bp');
                $originalBarangays = array_map('trim', explode(',', $originalTargetAudience));
                foreach ($originalBarangays as $targetBarangay) {
                    Cache::forget('announcements.' . $targetBarangay);
                    Cache::forget('announcements.' . $targetBarangay . '.bp');
                }
            }
            
            if ($announcement->targetAudience) {
                Cache::forget('announcements.' . $announcement->targetAudience);
                Cache::forget('announcements.' . $announcement->targetAudience . '.bp');
                $updatedBarangays = array_map('trim', explode(',', $announcement->targetAudience));
                foreach ($updatedBarangays as $targetBarangay) {
                    Cache::forget('announcements.' . $targetBarangay);
                    Cache::forget('announcements.' . $targetBarangay . '.bp');
                }
            }
            
            $notificationService = app(\App\Services\NotificationService::class);
            
            // Get the actual barangay to query for members
            // For Barangay Presidents, use their barangay
            // For Admin/SuperAdmin, we need to determine which members to notify
            $queryBarangay = null;
            if ($user->role === 'BarangayPresident') {
                $queryBarangay = $barangay;
            }
            
            // Get all active PWD members
            $membersQuery = \App\Models\PWDMember::where('status', 'Active')->with('user');
            
            // If we have a specific barangay (Barangay President), filter by it
            if ($queryBarangay) {
                $membersQuery->where('barangay', $queryBarangay);
            } elseif (!in_array($targetAudience, ['All', 'All Barangays', 'Members'])) {
                // For Admin/SuperAdmin with specific barangay target, filter by target audience
                $targetBarangays = array_map('trim', explode(',', $targetAudience));
                $membersQuery->whereIn('barangay', $targetBarangays);
            }
            // If targetAudience is All/All Barangays/Members, get all active members
            
            $members = $membersQuery->get();

            $notificationsSent = 0;
            $eligibilityNoticesSent = 0;

            foreach ($members as $member) {
                if ($member->user && $member->user->userID) {
                    // Send announcement notification
                    $notificationService::create(
                        $member->user->userID,
                        'announcement',
                        $announcement->title,
                        $announcement->content,
                        [
                            'announcement_id' => $announcement->announcementID,
                            'benefit_id' => $benefit ? $benefit->id : null,
                            'timestamp' => now()->toIso8601String()
                        ]
                    );
                    $notificationsSent++;

                    // Send eligibility notice if there's a related benefit
                    if ($benefit) {
                        $notificationService::create(
                            $member->user->userID,
                            'benefit_eligibility',
                            'You are eligible for: ' . $benefit->title,
                            "You are eligible to claim the {$benefit->title} benefit. Please visit the PDAO office or use the QR code scanning feature to claim your benefit.",
                            [
                                'benefit_id' => $benefit->id,
                                'announcement_id' => $announcement->announcementID,
                                'timestamp' => now()->toIso8601String()
                            ]
                        );
                        $eligibilityNoticesSent++;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Announcement sent to all registered members',
                'notifications_sent' => $notificationsSent,
                'eligibility_notices_sent' => $eligibilityNoticesSent,
                'total_members' => $members->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to announce to members: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to announce to members: ' . $e->getMessage()
            ], 500);
        }
    }
}