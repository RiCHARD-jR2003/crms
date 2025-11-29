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
        Cache::forget('announcements.all');
        Cache::forget('announcements.admin');
        Cache::forget('announcements.' . $request->targetAudience);
        
        // If targetAudience is comma-separated, clear cache for each barangay
        if (strpos($request->targetAudience, ',') !== false) {
            $barangays = array_map('trim', explode(',', $request->targetAudience));
            foreach ($barangays as $barangay) {
                Cache::forget('announcements.' . $barangay);
            }
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
        
        // Set category to type if category not provided but type is being updated
        if (isset($updateData['type']) && empty($updateData['category'])) {
            $updateData['category'] = $updateData['type'];
        }

        $announcement->update($updateData);
        
        // Clear announcements cache
        Cache::forget('announcements.all');
        Cache::forget('announcements.admin');
        if ($announcement->targetAudience) {
            Cache::forget('announcements.' . $announcement->targetAudience);
            
            // If targetAudience is comma-separated, clear cache for each barangay
            if (strpos($announcement->targetAudience, ',') !== false) {
                $barangays = array_map('trim', explode(',', $announcement->targetAudience));
                foreach ($barangays as $barangay) {
                    Cache::forget('announcements.' . $barangay);
                }
            }
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
        Cache::forget('announcements.all');
        Cache::forget('announcements.admin');
        if ($targetAudience) {
            Cache::forget('announcements.' . $targetAudience);
            
            // If targetAudience is comma-separated, clear cache for each barangay
            if (strpos($targetAudience, ',') !== false) {
                $barangays = array_map('trim', explode(',', $targetAudience));
                foreach ($barangays as $barangay) {
                    Cache::forget('announcements.' . $barangay);
                }
            }
        }

        return response()->json(['message' => 'Announcement deleted successfully']);
    }

    public function getByAudience($audience)
    {
        // Sort by publishDate (desc) first, then created_at (desc) for latest-first
        $announcements = Cache::remember('announcements.' . $audience, now()->addMinutes(10), function () use ($audience) {
            return Announcement::with('author')
                ->where('status', 'Active')
                ->where(function($query) {
                    $query->whereNull('expiryDate')
                          ->orWhere('expiryDate', '>=', now()->toDateString());
                })
                ->where(function($query) use ($audience) {
                    // Match exact audience
                    $query->where('targetAudience', $audience)
                          // Match "All Barangays" announcements
                          ->orWhere('targetAudience', 'All Barangays')
                          // Match comma-separated audiences that include this barangay
                          ->orWhere('targetAudience', 'LIKE', $audience . ',%')
                          ->orWhere('targetAudience', 'LIKE', '%, ' . $audience . ',%')
                          ->orWhere('targetAudience', 'LIKE', '%, ' . $audience)
                          ->orWhere('targetAudience', 'LIKE', '%' . $audience . '%');
                })
                ->orderByRaw('COALESCE(publishDate, created_at) DESC')
                ->orderBy('created_at', 'DESC')
                ->get();
        });
        
        // Additional filtering to ensure exact barangay match (handle comma-separated lists)
        $filteredAnnouncements = $announcements->filter(function($announcement) use ($audience) {
            $targetAudience = $announcement->targetAudience;
            
            // Exact match
            if ($targetAudience === $audience) {
                return true;
            }
            
            // "All Barangays" - show to everyone (system-wide announcements)
            if ($targetAudience === 'All Barangays') {
                return true;
            }
            
            // Check if audience is in comma-separated list (for multiple barangays)
            $barangays = array_map('trim', explode(',', $targetAudience));
            return in_array($audience, $barangays);
        });
        
        return response()->json($filteredAnnouncements->values());
    }
}