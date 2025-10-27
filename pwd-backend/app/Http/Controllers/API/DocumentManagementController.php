<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RequiredDocument;
use App\Models\MemberDocument;
use App\Models\DocumentNotification;
use App\Models\PWDMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DocumentManagementController extends Controller
{
    // Admin functions
    public function index(Request $request)
    {
        // Check if this is a superadmin request (for document management page)
        $isSuperAdmin = $request->user() && $request->user()->role === 'SuperAdmin';
        
        if ($isSuperAdmin) {
            // SuperAdmin sees all documents for management
            $documents = RequiredDocument::with('creator')
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Public/application form sees only active documents within date range
            $documents = RequiredDocument::with('creator')
                ->active()
                ->where(function($query) {
                    $query->whereNull('effective_date')
                          ->orWhere('effective_date', '<=', now());
                })
                ->where(function($query) {
                    $query->whereNull('expiry_date')
                          ->orWhere('expiry_date', '>=', now());
                })
                ->orderBy('created_at', 'desc')
                ->get()
                ->unique('name') // Remove duplicates based on document name
                ->values(); // Re-index array
        }

        return response()->json([
            'success' => true,
            'documents' => $documents
        ]);
    }

    public function getPublicDocuments()
    {
        // Public endpoint for application form - returns only active documents within date range
        $documents = RequiredDocument::active()
            ->where(function($query) {
                $query->whereNull('effective_date')
                      ->orWhere('effective_date', '<=', now());
            })
            ->where(function($query) {
                $query->whereNull('expiry_date')
                      ->orWhere('expiry_date', '>=', now());
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->unique('name') // Remove duplicates based on document name
            ->values(); // Re-index array

        return response()->json([
            'success' => true,
            'documents' => $documents
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_required' => 'boolean',
            'file_types' => 'nullable|array',
            'file_types.*' => 'string|in:pdf,jpg,jpeg,png,doc,docx',
            'max_file_size' => 'integer|min:2048|max:51200', // 2MB to 50MB
            'effective_date' => 'nullable|date|after_or_equal:today',
            'expiry_date' => 'nullable|date|after:effective_date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $document = RequiredDocument::create([
                'name' => $request->name,
                'description' => $request->description,
                'is_required' => $request->is_required ?? true,
                'file_types' => $request->file_types ?? ['pdf', 'jpg', 'jpeg', 'png'],
                'max_file_size' => $request->max_file_size ?? 2048,
                'created_by' => $request->user()->userID,
                'effective_date' => $request->effective_date,
                'expiry_date' => $request->expiry_date
            ]);

            // Notify all PWD members about the new required document
            $this->notifyMembers($document);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Required document created successfully',
                'document' => $document->load('creator')
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create required document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $document = RequiredDocument::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_required' => 'boolean',
            'file_types' => 'nullable|array',
            'file_types.*' => 'string|in:pdf,jpg,jpeg,png,doc,docx',
            'max_file_size' => 'integer|min:2048|max:51200', // 2MB to 50MB
            'status' => 'in:active,inactive',
            'effective_date' => 'nullable|date|after_or_equal:today',
            'expiry_date' => 'nullable|date|after:effective_date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $document->update($request->only([
            'name', 'description', 'is_required', 'file_types', 
            'max_file_size', 'status', 'effective_date', 'expiry_date'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Required document updated successfully',
            'document' => $document->load('creator')
        ]);
    }

    public function destroy($id)
    {
        $document = RequiredDocument::findOrFail($id);
        
        // Check if any members have uploaded this document
        $memberDocuments = MemberDocument::where('required_document_id', $id)->count();
        
        if ($memberDocuments > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete document. Members have already uploaded this document.'
            ], 400);
        }

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Required document deleted successfully'
        ]);
    }

    // Member functions
    public function getMemberDocuments(Request $request)
    {
        $memberId = $request->user()->userID;
        
        $documents = RequiredDocument::active()
            ->with(['memberDocuments' => function($query) use ($memberId) {
                $query->where('member_id', $memberId);
            }])
            ->orderBy('is_required', 'desc')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'documents' => $documents
        ]);
    }

    public function uploadDocument(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'required_document_id' => 'required|exists:required_documents,id',
            'document' => 'required|file|max:10240' // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $requiredDocument = RequiredDocument::findOrFail($request->required_document_id);
        $memberId = $request->user()->userID;

        // Validate file type
        $file = $request->file('document');
        $fileExtension = strtolower($file->getClientOriginalExtension());
        
        if (!in_array($fileExtension, $requiredDocument->file_types)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid file type. Allowed types: ' . implode(', ', $requiredDocument->file_types)
            ], 422);
        }

        // Validate file size
        if ($file->getSize() > ($requiredDocument->max_file_size * 1024)) {
            return response()->json([
                'success' => false,
                'message' => 'File size exceeds maximum allowed size of ' . $requiredDocument->max_file_size . 'KB'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Store file
            $uploadPath = 'member-documents/' . date('Y/m/d');
            $fileName = 'doc_' . $memberId . '_' . $requiredDocument->id . '_' . time() . '.' . $fileExtension;
            $filePath = $file->storeAs($uploadPath, $fileName, 'public');

            // Delete existing document if any
            $existingDocument = MemberDocument::where('member_id', $memberId)
                ->where('required_document_id', $requiredDocument->id)
                ->first();

            if ($existingDocument) {
                Storage::disk('public')->delete($existingDocument->file_path);
                $existingDocument->delete();
            }

            // Create new document record
            $memberDocument = MemberDocument::create([
                'member_id' => $memberId,
                'required_document_id' => $requiredDocument->id,
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'file_type' => $file->getMimeType(),
                'uploaded_at' => now(),
                'status' => 'pending'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'document' => $memberDocument
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getDocumentFile($id)
    {
        try {
            // Check for token-based authentication
            $user = Auth::user();
            if (!$user && request()->has('token')) {
                $token = request()->get('token');
                $user = \App\Models\User::where('remember_token', $token)->first();
                if ($user) {
                    Auth::setUser($user);
                }
            }
            
            $memberDocument = MemberDocument::findOrFail($id);
            
            // Check permissions if user is authenticated
            if ($user) {
                // Admin users can access any file
                if (!in_array($user->role, ['Admin', 'SuperAdmin'])) {
                    // PWD members can only access their own files
                    if ($user->role === 'PWDMember' && $memberDocument->member_id !== $user->userID) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Unauthorized access to document'
                        ], 403);
                    }
                }
            }
            
            $filePath = storage_path('app/public/' . $memberDocument->file_path);
            
            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found at path: ' . $filePath
                ], 404);
            }

            // Get file info
            $fileSize = filesize($filePath);
            $mimeType = mime_content_type($filePath);
            
            // Set appropriate headers
            $headers = [
                'Content-Type' => $mimeType,
                'Content-Length' => $fileSize,
                'Content-Disposition' => 'inline; filename="' . $memberDocument->file_name . '"',
                'Cache-Control' => 'private, max-age=3600',
                'Pragma' => 'private'
            ];

            // Return file response with proper headers
            return response()->file($filePath, $headers);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error serving file: ' . $e->getMessage()
            ], 500);
        }
    }

    // Admin review functions
    public function reviewDocument(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $memberDocument = MemberDocument::findOrFail($id);
        
        $memberDocument->update([
            'status' => $request->status,
            'notes' => $request->notes,
            'reviewed_by' => $request->user()->userID,
            'reviewed_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document review completed',
            'document' => $memberDocument->load('reviewer')
        ]);
    }

    public function getPendingReviews()
    {
        $documents = MemberDocument::with(['member', 'requiredDocument', 'reviewer'])
            ->where('status', 'pending')
            ->orderBy('uploaded_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'documents' => $documents
        ]);
    }

    // Notification functions
    public function getNotifications(Request $request)
    {
        $memberId = $request->user()->userID;
        
        $notifications = DocumentNotification::with('requiredDocument')
            ->where('member_id', $memberId)
            ->orderBy('sent_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'notifications' => $notifications
        ]);
    }

    public function markNotificationAsRead(Request $request, $id)
    {
        $notification = DocumentNotification::where('id', $id)
            ->where('member_id', $request->user()->userID)
            ->firstOrFail();

        $notification->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    }

    // Private helper methods
    private function notifyMembers(RequiredDocument $document)
    {
        $members = PWDMember::all();

        foreach ($members as $member) {
            DocumentNotification::create([
                'member_id' => $member->userID,
                'required_document_id' => $document->id,
                'title' => 'New Required Document: ' . $document->name,
                'message' => 'A new required document "' . $document->name . '" has been added. Please upload this document to maintain your PWD membership status.',
                'sent_at' => now()
            ]);
        }
    }
}