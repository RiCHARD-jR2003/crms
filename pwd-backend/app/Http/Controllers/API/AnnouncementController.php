<?php
// app/Http/Controllers/API/AnnouncementController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

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
        
        // Automatically set publish date to current date if not provided
        if (empty($data['publishDate'])) {
            $data['publishDate'] = now()->toDateString();
        }
        
        // Set category to type if category not provided
        if (empty($data['category'])) {
            $data['category'] = $data['type'];
        }

        $announcement = Announcement::create($data);
        
        // Clear announcements cache
        $this->clearAnnouncementCache($request->targetAudience);

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
        
        // Set category to type if category not provided but type is being updated
        if (isset($updateData['type']) && empty($updateData['category'])) {
            $updateData['category'] = $updateData['type'];
        }

        $announcement->update($updateData);
        
        // Clear announcements cache
        $this->clearAnnouncementCache($announcement->targetAudience);

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
        // Sort by publishDate (desc) first, then created_at (desc) for latest-first
        // Cache for only 2 minutes to ensure fresh data
        $announcements = Cache::remember('announcements.' . $audience, now()->addMinutes(2), function () use ($audience) {
            return Announcement::with('author')
                ->where('status', 'Active')
                ->where(function($query) {
                    $query->whereNull('expiryDate')
                          ->orWhere('expiryDate', '>=', now()->toDateString());
                })
                ->where(function($query) use ($audience) {
                    // Match exact audience
                    $query->where('targetAudience', $audience)
                          // Match "All" announcements (broadcast to everyone)
                          ->orWhere('targetAudience', 'All')
                          // Match "All Barangays" announcements
                          ->orWhere('targetAudience', 'All Barangays')
                          // Match "Members" announcements (all PWD members)
                          ->orWhere('targetAudience', 'Members')
                          // Match comma-separated audiences that include this barangay
                          ->orWhere('targetAudience', 'LIKE', $audience . ',%')
                          ->orWhere('targetAudience', 'LIKE', '%, ' . $audience . ',%')
                          ->orWhere('targetAudience', 'LIKE', '%, ' . $audience)
                          ->orWhere('targetAudience', 'LIKE', '%' . $audience . '%')
                          // Match comma-separated that include "Members" or "All"
                          ->orWhere('targetAudience', 'LIKE', '%Members%')
                          ->orWhere('targetAudience', 'LIKE', '%All%');
                })
                ->orderByRaw('COALESCE(publishDate, created_at) DESC')
                ->orderBy('created_at', 'DESC')
                ->get();
        });
        
        // Additional filtering to ensure exact match (handle comma-separated lists)
        $filteredAnnouncements = $announcements->filter(function($announcement) use ($audience) {
            $targetAudience = $announcement->targetAudience;
            
            // Exact match
            if ($targetAudience === $audience) {
                return true;
            }
            
            // "All" or "All Barangays" - show to everyone (system-wide announcements)
            if ($targetAudience === 'All' || $targetAudience === 'All Barangays') {
                return true;
            }
            
            // "Members" - show to all PWD members
            if ($targetAudience === 'Members') {
                return true;
            }
            
            // Check if audience is in comma-separated list (for multiple barangays)
            $barangays = array_map('trim', explode(',', $targetAudience));
            
            // Check for this specific barangay, or "Members", or "All"
            if (in_array($audience, $barangays) || in_array('Members', $barangays) || in_array('All', $barangays)) {
                return true;
            }
            
            return false;
        });
        
        return response()->json($filteredAnnouncements->values());
    }
}