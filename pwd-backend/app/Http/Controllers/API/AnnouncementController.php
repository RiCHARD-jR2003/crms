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
        // Enhanced validation with minimum content length
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:10|max:200',
            'content' => 'required|string|min:50', // Minimum 50 characters
            'type' => 'required|string|in:Information,Event,Notice,Emergency,System Update,Reminder,Deadline,Advisory',
            'priority' => 'required|string|in:Low,Medium,High',
            'targetAudience' => 'required|string|max:100',
            'status' => 'required|string|in:Draft,Active,Archived',
            'expiryDate' => 'nullable|date|after_or_equal:today',
            'category' => 'nullable|string|max:50',
        ], [
            'title.min' => 'Title must be at least 10 characters long.',
            'title.max' => 'Title cannot exceed 200 characters.',
            'content.min' => 'Content must be at least 50 characters long. Please provide detailed information.',
            'type.in' => 'Invalid announcement type. Must be one of: Information, Event, Notice, Emergency, System Update, Reminder, Deadline, Advisory.',
        ]);

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

        // Enhanced validation with minimum content length
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|min:10|max:200',
            'content' => 'sometimes|required|string|min:50',
            'type' => 'sometimes|required|string|in:Information,Event,Notice,Emergency,System Update,Reminder,Deadline,Advisory',
            'priority' => 'sometimes|required|string|in:Low,Medium,High',
            'targetAudience' => 'sometimes|required|string|max:100',
            'status' => 'sometimes|required|string|in:Draft,Active,Archived',
            'expiryDate' => 'sometimes|nullable|date|after_or_equal:today',
            'category' => 'sometimes|nullable|string|max:50',
        ], [
            'title.min' => 'Title must be at least 10 characters long.',
            'title.max' => 'Title cannot exceed 200 characters.',
            'content.min' => 'Content must be at least 50 characters long. Please provide detailed information.',
            'type.in' => 'Invalid announcement type. Must be one of: Information, Event, Notice, Emergency, System Update, Reminder, Deadline, Advisory.',
        ]);

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
        }

        return response()->json(['message' => 'Announcement deleted successfully']);
    }

    public function getByAudience($audience)
    {
        // Sort by publishDate (desc) first, then created_at (desc) for latest-first
        $announcements = Cache::remember('announcements.' . $audience, now()->addMinutes(10), function () use ($audience) {
            return Announcement::with('author')
                ->where('targetAudience', $audience)
                ->where('status', 'Active')
                ->where(function($query) {
                    $query->whereNull('expiryDate')
                          ->orWhere('expiryDate', '>=', now()->toDateString());
                })
                ->orderByRaw('COALESCE(publishDate, created_at) DESC')
                ->orderBy('created_at', 'DESC')
                ->get();
        });
        
        return response()->json($announcements);
    }
}