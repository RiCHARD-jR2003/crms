<?php
// app/Http/Controllers/API/AnnouncementController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('author')->get();
        return response()->json($announcements);
    }

    public function getAdminAnnouncements()
    {
        // Get announcements created by Admin users
        $adminAnnouncements = Announcement::with('author')
            ->whereHas('author', function($query) {
                $query->where('role', 'Admin');
            })
            ->get();
        
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

        return response()->json($announcement);
    }

    public function destroy($id)
    {
        $announcement = Announcement::find($id);
        
        if (!$announcement) {
            return response()->json(['message' => 'Announcement not found'], 404);
        }

        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted successfully']);
    }

    public function getByAudience($audience)
    {
        $announcements = Announcement::with('author')->where('targetAudience', $audience)->get();
        return response()->json($announcements);
    }
}