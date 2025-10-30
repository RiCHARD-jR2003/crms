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
        $announcements = Cache::remember('announcements.all', now()->addMinutes(10), function () {
            return Announcement::with('author')->get();
        });
        
        return response()->json($announcements);
    }

    public function getAdminAnnouncements()
    {
        // Cache admin announcements for 10 minutes
        $adminAnnouncements = Cache::remember('announcements.admin', now()->addMinutes(10), function () {
            return Announcement::with('author')
                ->whereHas('author', function($query) {
                    $query->where('role', 'Admin');
                })
                ->get();
        });
        
        return response()->json($adminAnnouncements);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:100',
            'content' => 'required|string',
            'type' => 'required|string|in:Information,Event,Notice,Emergency',
            'priority' => 'required|string|in:Low,Medium,High',
            'targetAudience' => 'required|string|max:100',
            'status' => 'required|string|in:Draft,Active,Archived',
            'expiryDate' => 'nullable|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // For now, use a default authorID (you can get this from auth later)
        $data = $request->all();
        $data['authorID'] = 1; // Default author ID
        $data['views'] = 0;
        
        // Automatically set publish date to current date
        $data['publishDate'] = now()->toDateString();

        $announcement = Announcement::create($data);
        
        // Clear announcements cache
        Cache::forget('announcements.all');
        Cache::forget('announcements.admin');
        Cache::forget('announcements.' . $request->targetAudience);

        return response()->json($announcement, 201);
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

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:100',
            'content' => 'sometimes|required|string',
            'type' => 'sometimes|required|string|in:Information,Event,Notice,Emergency',
            'priority' => 'sometimes|required|string|in:Low,Medium,High',
            'targetAudience' => 'sometimes|required|string|max:100',
            'status' => 'sometimes|required|string|in:Draft,Active,Archived',
            'expiryDate' => 'sometimes|nullable|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $announcement->update($request->all());
        
        // Clear announcements cache
        Cache::forget('announcements.all');
        Cache::forget('announcements.admin');
        if ($announcement->targetAudience) {
            Cache::forget('announcements.' . $announcement->targetAudience);
        }

        return response()->json($announcement);
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
        $announcements = Cache::remember('announcements.' . $audience, now()->addMinutes(10), function () use ($audience) {
            return Announcement::with('author')->where('targetAudience', $audience)->get();
        });
        
        return response()->json($announcements);
    }
}