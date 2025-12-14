<?php
// app/Http/Controllers/API/AnnouncementController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\User;
use App\Models\PWDMember;
use App\Models\BarangayPresident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Services\NotificationService;

class AnnouncementController extends Controller
{
    // List of all barangays for cache clearing (must match frontend naming exactly)
    private $allBarangays = [
        'Baclaran', 'Banay-Banay', 'Banlic', 'Bigaa', 'Butong', 'Casile',
        'Diezmo', 'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'Pittland',
        'Pulo', 'Sala', 'San Isidro',
        'Barangay I Poblacion', 'Barangay II Poblacion', 'Barangay III Poblacion'
    ];

    /**
     * Helper function to clear announcement cache
     * Now clears ALL caches to ensure fresh data across all dashboards
     */
    private function clearAnnouncementCache($targetAudience = null)
    {
        // Clear general caches
        Cache::forget('announcements.all');
        Cache::forget('announcements.admin');
        Cache::forget('announcements.Members');
        Cache::forget('announcements.All');
        Cache::forget('announcements.All Barangays');
        
        // Always clear cache for ALL barangays to ensure fresh data
        // This prevents stale data issues when announcements target multiple barangays
        foreach ($this->allBarangays as $barangay) {
            Cache::forget('announcements.' . $barangay);
        }
        
        // Also clear any specific targetAudience cache if provided
        if ($targetAudience) {
            Cache::forget('announcements.' . $targetAudience);
            
            // If targetAudience is comma-separated, clear cache for each mentioned barangay
            if (strpos($targetAudience, ',') !== false) {
                $barangays = array_map('trim', explode(',', $targetAudience));
                foreach ($barangays as $barangay) {
                    Cache::forget('announcements.' . $barangay);
                }
            }
        }
    }

    public function index()
    {
        // Cache announcements for 10 minutes (infrequently changed)
        // Sort by publishDate (desc) first, then created_at (desc) for latest-first
        $announcements = Cache::remember('announcements.all', now()->addMinutes(10), function () {
            return Announcement::with('author')
                ->orderByRaw('COALESCE(publishDate, created_at) DESC')
                ->orderBy('created_at', 'DESC')
                ->get();
        });
        
        return response()->json($announcements);
    }

    public function getAdminAnnouncements()
    {
        // Cache admin announcements for 10 minutes
        // Sort by publishDate (desc) first, then created_at (desc) for latest-first
        $adminAnnouncements = Cache::remember('announcements.admin', now()->addMinutes(10), function () {
            return Announcement::with('author')
                ->whereHas('author', function($query) {
                    $query->where('role', 'Admin');
                })
                ->orderByRaw('COALESCE(publishDate, created_at) DESC')
                ->orderBy('created_at', 'DESC')
                ->get();
        });
        
        return response()->json($adminAnnouncements);
    }

    public function store(Request $request)
    {
        // Comprehensive validation - all key fields are mandatory
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:10|max:200',
            'content' => 'required|string|min:100', // Increased minimum for detailed information
            'type' => 'required|string|in:Information,Event,Notice,Emergency,System Update,Reminder,Deadline,Advisory',
            'priority' => 'required|string|in:Low,Medium,High',
            'targetAudience' => 'required|string|max:100',
            'status' => 'required|string|in:Draft,Active,Archived',
            'publishDate' => 'required|date', // Date & time of announcement is now required
            'expiryDate' => 'nullable|date|after_or_equal:publishDate',
            'category' => 'nullable|string|max:50',
            'benefitID' => 'nullable|exists:benefit,id', // Related program/ayuda if applicable
        ], [
            'title.required' => 'Title is required.',
            'title.min' => 'Title must be at least 10 characters long.',
            'title.max' => 'Title cannot exceed 200 characters.',
            'content.required' => 'Full description/details are required.',
            'content.min' => 'Content must be at least 100 characters long. Please provide detailed information including instructions, eligibility, deadlines, location, and contact details.',
            'type.required' => 'Announcement type is required.',
            'type.in' => 'Invalid announcement type. Must be one of: Information, Event, Notice, Emergency, System Update, Reminder, Deadline, Advisory.',
            'priority.required' => 'Priority level is required.',
            'targetAudience.required' => 'Targeted barangays are required.',
            'publishDate.required' => 'Date & time of announcement is required.',
            'publishDate.date' => 'Invalid date format for announcement date.',
            'expiryDate.after_or_equal' => 'Expiry date must be on or after the publish date.',
            'benefitID.exists' => 'The selected benefit/program does not exist.',
        ]);
        
        // Additional validation: Check if content contains placeholder text (for Draft status)
        if ($request->status === 'Active' && strpos($request->content, '[TO BE SPECIFIED]') !== false) {
            $validator->errors()->add('content', 'Cannot post announcement with incomplete details. Please remove all [TO BE SPECIFIED] placeholders.');
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        // Check for duplicate announcements (same title + same type within 24 hours)
        $duplicateCheck = Announcement::where('title', $request->title)
            ->where('type', $request->type)
            ->where('created_at', '>=', now()->subHours(24))
            ->first();

        if ($duplicateCheck) {
            return response()->json([
                'success' => false,
                'error' => 'Duplicate announcement detected',
                'message' => 'An announcement with the same title and type was posted within the last 24 hours. Please review existing announcements or modify the title/type.',
                'duplicate' => [
                    'id' => $duplicateCheck->announcementID,
                    'title' => $duplicateCheck->title,
                    'created_at' => $duplicateCheck->created_at,
                ]
            ], 409); // 409 Conflict
        }

        // Get author ID from authenticated user
        $authorID = $request->user() ? $request->user()->userID : 1;
        
        $data = $request->all();
        $data['authorID'] = $authorID;
        $data['views'] = 0;
        
        // Automatically set publish date to current datetime if not provided (preserve time)
        if (empty($data['publishDate'])) {
            $data['publishDate'] = now()->toDateTimeString(); // Use toDateTimeString() instead of toDateString()
        } else {
            // Ensure publishDate includes time component
            // If only date is provided (YYYY-MM-DD), add current time
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['publishDate'])) {
                $data['publishDate'] = $data['publishDate'] . ' ' . now()->format('H:i:s');
            }
        }
        
        // Set category to type if category not provided
        if (empty($data['category'])) {
            $data['category'] = $data['type'];
        }

        $announcement = Announcement::create($data);
        
        // Clear ALL announcement caches to ensure fresh data
        $this->clearAnnouncementCache($request->targetAudience);
        // Also clear cache for "All" and all barangays to ensure system-wide announcements show immediately
        Cache::forget('announcements.All');
        Cache::forget('announcements.All.bp');
        // Clear cache for all barangays to ensure fresh data
        foreach ($this->allBarangays as $barangay) {
            Cache::forget('announcements.' . $barangay);
            Cache::forget('announcements.' . $barangay . '.bp');
        }

        // Send notifications if announcement is Active
        if ($request->status === 'Active') {
            $this->sendAnnouncementNotifications($announcement);
        }

        return response()->json([
            'success' => true,
            'message' => 'Announcement created successfully',
            'data' => $announcement
        ], 201);
    }

    public function show($id)
    {
        $announcement = Announcement::with('author')->find($id);
        
        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }
        
        return response()->json($announcement);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::find($id);
        
        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        // Comprehensive validation - all key fields are mandatory when updating
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|min:10|max:200',
            'content' => 'sometimes|required|string|min:100', // Increased minimum for detailed information
            'type' => 'sometimes|required|string|in:Information,Event,Notice,Emergency,System Update,Reminder,Deadline,Advisory',
            'priority' => 'sometimes|required|string|in:Low,Medium,High',
            'targetAudience' => 'sometimes|required|string|max:100',
            'status' => 'sometimes|required|string|in:Draft,Active,Archived',
            'publishDate' => 'sometimes|required|date', // Date & time of announcement is now required
            'expiryDate' => 'sometimes|nullable|date|after_or_equal:publishDate',
            'category' => 'sometimes|nullable|string|max:50',
            'benefitID' => 'sometimes|nullable|exists:benefit,id', // Related program/ayuda if applicable
        ], [
            'title.required' => 'Title is required.',
            'title.min' => 'Title must be at least 10 characters long.',
            'title.max' => 'Title cannot exceed 200 characters.',
            'content.required' => 'Full description/details are required.',
            'content.min' => 'Content must be at least 100 characters long. Please provide detailed information including instructions, eligibility, deadlines, location, and contact details.',
            'type.required' => 'Announcement type is required.',
            'type.in' => 'Invalid announcement type. Must be one of: Information, Event, Notice, Emergency, System Update, Reminder, Deadline, Advisory.',
            'priority.required' => 'Priority level is required.',
            'targetAudience.required' => 'Targeted barangays are required.',
            'publishDate.required' => 'Date & time of announcement is required.',
            'publishDate.date' => 'Invalid date format for announcement date.',
            'expiryDate.after_or_equal' => 'Expiry date must be on or after the publish date.',
            'benefitID.exists' => 'The selected benefit/program does not exist.',
        ]);
        
        // Additional validation: Check if content contains placeholder text (for Active status)
        if ($request->has('status') && $request->status === 'Active' && strpos($request->content, '[TO BE SPECIFIED]') !== false) {
            $validator->errors()->add('content', 'Cannot post announcement with incomplete details. Please remove all [TO BE SPECIFIED] placeholders.');
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        // Check for duplicate announcements if title or type is being changed
        if ($request->has('title') || $request->has('type')) {
            $title = $request->get('title', $announcement->title);
            $type = $request->get('type', $announcement->type);
            
            $duplicateCheck = Announcement::where('title', $title)
                ->where('type', $type)
                ->where('announcementID', '!=', $id) // Exclude current announcement
                ->where('created_at', '>=', now()->subHours(24))
                ->first();

            if ($duplicateCheck) {
                return response()->json([
                    'success' => false,
                    'error' => 'Duplicate announcement detected',
                    'message' => 'An announcement with the same title and type was posted within the last 24 hours. Please review existing announcements or modify the title/type.',
                    'duplicate' => [
                        'id' => $duplicateCheck->announcementID,
                        'title' => $duplicateCheck->title,
                        'created_at' => $duplicateCheck->created_at,
                    ]
                ], 409); // 409 Conflict
            }
        }

        $updateData = $request->all();
        
        // Ensure publishDate includes time component if provided
        if (isset($updateData['publishDate']) && !empty($updateData['publishDate'])) {
            // If only date is provided (YYYY-MM-DD), add current time
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $updateData['publishDate'])) {
                $updateData['publishDate'] = $updateData['publishDate'] . ' ' . now()->format('H:i:s');
            }
        }
        
        // Ensure expiryDate includes time component if provided
        if (isset($updateData['expiryDate']) && !empty($updateData['expiryDate'])) {
            // If only date is provided (YYYY-MM-DD), set to end of day
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $updateData['expiryDate'])) {
                $updateData['expiryDate'] = $updateData['expiryDate'] . ' 23:59:59';
            }
        }
        
        // Set category to type if category not provided but type is being updated
        if (isset($updateData['type']) && empty($updateData['category'])) {
            $updateData['category'] = $updateData['type'];
        }

        $oldStatus = $announcement->status;
        $announcement->update($updateData);
        $announcement->refresh(); // Refresh to get updated data
        
        // Clear ALL announcement caches to ensure fresh data
        $this->clearAnnouncementCache($announcement->targetAudience);
        // Also clear cache for "All" and all barangays to ensure system-wide announcements show immediately
        Cache::forget('announcements.All');
        Cache::forget('announcements.All.bp');
        // Clear cache for all barangays to ensure fresh data
        foreach ($this->allBarangays as $barangay) {
            Cache::forget('announcements.' . $barangay);
            Cache::forget('announcements.' . $barangay . '.bp');
        }

        // Send notifications if status changed to Active (newly published)
        if ($oldStatus !== 'Active' && $announcement->status === 'Active') {
            $this->sendAnnouncementNotifications($announcement);
        }

        return response()->json([
            'success' => true,
            'message' => 'Announcement updated successfully',
            'data' => $announcement
        ]);
    }

    public function destroy($id)
    {
        $announcement = Announcement::find($id);
        
        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        $targetAudience = $announcement->targetAudience;
        $announcement->delete();
        
        // Clear announcements cache
        $this->clearAnnouncementCache($targetAudience);

        return response()->json(['message' => 'Announcement deleted successfully']);
    }

    public function getByAudience($audience)
    {
        // Check if this is a Barangay President query by checking the authenticated user's role
        // This is more accurate than just checking if audience is a barangay name
        // (PWD members also query by barangay name, but shouldn't see BP-only announcements)
        $user = auth()->user();
        $isBarangayPresidentQuery = $user && $user->role === 'BarangayPresident' && $this->isBarangayName($audience);
        
        // Sort by publishDate (desc) first, then created_at (desc) for latest-first
        // Cache for only 1 minute to ensure fresh data (reduced from 2 minutes for faster updates)
        // For Barangay Presidents, also show Draft announcements so they can review and post them
        $cacheKey = 'announcements.' . $audience . ($isBarangayPresidentQuery ? '.bp' : '');
        $announcements = Cache::remember($cacheKey, now()->addMinutes(1), function () use ($audience, $isBarangayPresidentQuery) {
            $query = Announcement::with('author');
            
            // Barangay Presidents can see Draft announcements (for their barangay) so they can review and post
            if ($isBarangayPresidentQuery) {
                $query->whereIn('status', ['Active', 'Draft']);
            } else {
                $query->where('status', 'Active');
            }
            
            return $query->where(function($query) {
                    // Show announcements that haven't expired yet
                    // Use toDateTimeString() for datetime comparison, or toDateString() if expiryDate is date-only
                    $query->whereNull('expiryDate')
                          ->orWhere('expiryDate', '>=', now()->toDateTimeString())
                          ->orWhereDate('expiryDate', '>=', now()->toDateString());
                })
                ->where(function($query) use ($audience, $isBarangayPresidentQuery) {
                    // Match exact audience
                    $query->where('targetAudience', $audience)
                          // Match "All" announcements (broadcast to everyone including Barangay Presidents)
                          ->orWhere('targetAudience', 'All')
                          // Match "All Barangays" announcements
                          ->orWhere('targetAudience', 'All Barangays')
                          // Match "Members" announcements (all PWD members)
                          ->orWhere('targetAudience', 'Members')
                          // If Barangay President query, also include "Barangay President" announcements
                          ->when($isBarangayPresidentQuery, function($q) {
                              $q->orWhere('targetAudience', 'Barangay President')
                                ->orWhere('targetAudience', 'LIKE', '%Barangay President%');
                          })
                          // Match comma-separated audiences that include this barangay
                          ->orWhere('targetAudience', 'LIKE', $audience . ',%')
                          ->orWhere('targetAudience', 'LIKE', '%, ' . $audience . ',%')
                          ->orWhere('targetAudience', 'LIKE', '%, ' . $audience)
                          ->orWhere('targetAudience', 'LIKE', '%' . $audience . '%')
                          // Match comma-separated that include "Members", "All", or "Barangay President"
                          ->orWhere('targetAudience', 'LIKE', '%Members%')
                          ->orWhere('targetAudience', 'LIKE', '%All%')
                          ->when($isBarangayPresidentQuery, function($q) {
                              $q->orWhere('targetAudience', 'LIKE', '%Barangay President%');
                          });
                })
                ->orderByRaw('COALESCE(publishDate, created_at) DESC')
                ->orderBy('created_at', 'DESC')
                ->get();
        });
        
        // Additional filtering to ensure exact match (handle comma-separated lists)
        $filteredAnnouncements = $announcements->filter(function($announcement) use ($audience, $isBarangayPresidentQuery) {
            $targetAudience = trim($announcement->targetAudience ?? '');
            $audienceTrimmed = trim($audience);
            
            // Debug logging
            \Log::debug('Filtering announcement', [
                'announcement_id' => $announcement->announcementID,
                'announcement_title' => $announcement->title,
                'target_audience' => $targetAudience,
                'audience' => $audienceTrimmed,
                'status' => $announcement->status,
                'is_barangay_president_query' => $isBarangayPresidentQuery
            ]);
            
            // For Barangay Presidents, show Draft announcements for their barangay so they can review and post
            if ($isBarangayPresidentQuery && $announcement->status === 'Draft') {
                // Check if this draft announcement is for their barangay
                // Handle both comma and comma-space separators
                $barangays = preg_split('/\s*,\s*/', $targetAudience, -1, PREG_SPLIT_NO_EMPTY);
                $barangays = array_map('trim', $barangays);
                if (in_array($audienceTrimmed, $barangays)) {
                    \Log::debug('Draft announcement matched for BP', ['announcement_id' => $announcement->announcementID]);
                    return true;
                }
            }
            
            // Only show Active announcements to members (not Draft)
            if (!$isBarangayPresidentQuery && $announcement->status !== 'Active') {
                \Log::debug('Announcement filtered out - not Active', ['announcement_id' => $announcement->announcementID, 'status' => $announcement->status]);
                return false;
            }
            
            // Exact match (case-insensitive for barangay names)
            if (strcasecmp($targetAudience, $audienceTrimmed) === 0) {
                return true;
            }
            
            // "All" or "All Barangays" - show to everyone (system-wide announcements)
            if (strcasecmp($targetAudience, 'All') === 0 || strcasecmp($targetAudience, 'All Barangays') === 0) {
                return true;
            }
            
            // "Members" - show to all PWD members (and Barangay Presidents can see these too)
            if (strcasecmp($targetAudience, 'Members') === 0) {
                return true;
            }
            
            // "Barangay President" - show to all Barangay Presidents
            if ($isBarangayPresidentQuery && (stripos($targetAudience, 'Barangay President') !== false)) {
                return true;
            }
            
            // Check if audience is in comma-separated list (for multiple barangays)
            // Handle both comma and comma-space separators
            $barangays = preg_split('/\s*,\s*/', $targetAudience, -1, PREG_SPLIT_NO_EMPTY);
            $barangays = array_map('trim', $barangays);
            
            // Check for this specific barangay (case-insensitive), or "Members", "All", or "Barangay President"
            foreach ($barangays as $barangay) {
                $barangayTrimmed = trim($barangay);
                // Check if this barangay matches the audience
                if (strcasecmp($barangayTrimmed, $audienceTrimmed) === 0) {
                    \Log::debug('Announcement matched - barangay match', [
                        'announcement_id' => $announcement->announcementID,
                        'barangay' => $barangayTrimmed,
                        'audience' => $audienceTrimmed
                    ]);
                    return true;
                }
                // Check if this barangay is "Members" (case-insensitive) - show to all PWD members
                if (strcasecmp($barangayTrimmed, 'Members') === 0) {
                    \Log::debug('Announcement matched - contains Members', [
                        'announcement_id' => $announcement->announcementID,
                        'target_audience' => $targetAudience
                    ]);
                    return true;
                }
                // Check if this barangay is "All" (case-insensitive)
                if (strcasecmp($barangayTrimmed, 'All') === 0) {
                    \Log::debug('Announcement matched - contains All', ['announcement_id' => $announcement->announcementID]);
                    return true;
                }
                // Check if this barangay is "Barangay President" (case-insensitive) for BP queries
                if ($isBarangayPresidentQuery && stripos($barangayTrimmed, 'Barangay President') !== false) {
                    \Log::debug('Announcement matched - contains Barangay President', ['announcement_id' => $announcement->announcementID]);
                    return true;
                }
            }
            
            \Log::debug('Announcement filtered out - no match', [
                'announcement_id' => $announcement->announcementID,
                'target_audience' => $targetAudience,
                'audience' => $audienceTrimmed,
                'barangays_array' => $barangays
            ]);
            return false;
        });
        
        // Ensure announcements are sorted by publishDate (newest first), then created_at
        $sortedAnnouncements = $filteredAnnouncements->sortByDesc(function($announcement) {
            // Use publishDate if available, otherwise use created_at
            return $announcement->publishDate ? strtotime($announcement->publishDate) : strtotime($announcement->created_at);
        })->values();
        
        // Log the final count for debugging
        \Log::info('Announcements returned to frontend', [
            'audience' => $audience,
            'total_before_filter' => $announcements->count(),
            'total_after_filter' => $filteredAnnouncements->count(),
            'total_returned' => $sortedAnnouncements->count(),
            'announcement_ids' => $sortedAnnouncements->pluck('announcementID')->toArray(),
            'announcement_titles' => $sortedAnnouncements->pluck('title')->toArray()
        ]);
        
        return response()->json($sortedAnnouncements);
    }

    /**
     * Check if the given audience string is a barangay name
     * 
     * @param string $audience
     * @return bool
     */
    private function isBarangayName($audience)
    {
        // List of known barangays
        $barangays = [
            'Baclaran', 'Banay-Banay', 'Banlic', 'Bigaa', 'Butong', 'Casile',
            'Diezmo', 'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'Pittland',
            'Pulo', 'Sala', 'San Isidro',
            'Barangay I Poblacion', 'Barangay II Poblacion', 'Barangay III Poblacion',
            'Pob. Uno', 'Pob. Dos', 'Pob. Tres'
        ];
        
        return in_array($audience, $barangays);
    }

    /**
     * Send announcement notifications to all relevant users based on targetAudience
     *
     * @param Announcement $announcement
     * @return void
     */
    private function sendAnnouncementNotifications($announcement)
    {
        try {
            $targetAudience = $announcement->targetAudience;
            $userIds = [];

            // Parse targetAudience (can be comma-separated)
            $audiences = array_map('trim', explode(',', $targetAudience));

            foreach ($audiences as $audience) {
                $audience = trim($audience);

                if ($audience === 'All') {
                    // Send to ALL user types
                    $allUsers = User::whereIn('role', [
                        'PWDMember',
                        'Admin',
                        'SuperAdmin',
                        'BarangayPresident',
                        'FrontDesk',
                        'Staff1',
                        'Staff2'
                    ])->pluck('userID')->toArray();
                    $userIds = array_merge($userIds, $allUsers);
                } elseif ($audience === 'Members') {
                    // Send to all PWD Members
                    $memberUsers = User::where('role', 'PWDMember')
                        ->pluck('userID')
                        ->toArray();
                    $userIds = array_merge($userIds, $memberUsers);
                } elseif ($audience === 'Barangay President') {
                    // Send to all Barangay Presidents
                    $bpUsers = User::where('role', 'BarangayPresident')
                        ->pluck('userID')
                        ->toArray();
                    $userIds = array_merge($userIds, $bpUsers);
                } else {
                    // Specific barangay - send to PWD Members in that barangay and their Barangay President
                    $barangayMembers = PWDMember::where('barangay', $audience)
                        ->where('status', 'Active')
                        ->pluck('userID')
                        ->toArray();
                    $userIds = array_merge($userIds, $barangayMembers);

                    // Also send to Barangay President for that barangay (if they exist)
                    // BarangayPresident users have barangay stored in their related model
                    $bpUserIds = BarangayPresident::where('barangay', $audience)
                        ->pluck('userID')
                        ->toArray();
                    $userIds = array_merge($userIds, $bpUserIds);
                }
            }

            // Remove duplicates
            $userIds = array_unique($userIds);

            if (empty($userIds)) {
                Log::warning('No users found for announcement notification', [
                    'announcement_id' => $announcement->announcementID,
                    'target_audience' => $targetAudience
                ]);
                return;
            }

            // Truncate message if too long (notification messages have limits)
            $message = $announcement->content;
            if (strlen($message) > 500) {
                $message = substr($message, 0, 497) . '...';
            }

            // Send notifications
            $notificationType = 'announcement';
            $title = $announcement->title;
            
            // Add priority indicator to title if High priority
            if ($announcement->priority === 'High') {
                $title = '🔴 ' . $title;
            } elseif ($announcement->priority === 'Medium') {
                $title = '🟡 ' . $title;
            }

            $data = [
                'announcement_id' => $announcement->announcementID,
                'announcement_title' => $announcement->title,
                'announcement_type' => $announcement->type,
                'announcement_priority' => $announcement->priority,
                'target_audience' => $targetAudience,
                'publish_date' => $announcement->publishDate,
                'expiry_date' => $announcement->expiryDate,
                'timestamp' => now()->toIso8601String()
            ];

            $notificationsSent = NotificationService::createMultiple(
                $userIds,
                $notificationType,
                $title,
                $message,
                $data
            );

            Log::info('Announcement notifications sent', [
                'announcement_id' => $announcement->announcementID,
                'target_audience' => $targetAudience,
                'notifications_sent' => $notificationsSent,
                'total_users' => count($userIds)
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send announcement notifications', [
                'announcement_id' => $announcement->announcementID ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}