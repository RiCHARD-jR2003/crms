<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\PWDMember;
use App\Models\Admin;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class SupportTicketController extends Controller
{
    /**
     * Display a listing of support tickets.
     * For admin: shows all tickets
     * For PWD member: shows only their tickets
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user->role === 'Admin') {
                // Admin can see all tickets
        $tickets = SupportTicket::with(['pwdMember.user', 'messages'])
            ->orderBy('created_at', 'desc')
            ->get();
            } elseif ($user->role === 'PWDMember') {
                // PWD member can only see their own tickets
                $pwdMember = PWDMember::where('userID', $user->userID)->first();
                if (!$pwdMember) {
                    return response()->json(['error' => 'PWD Member not found'], 404);
                }
                
                $tickets = SupportTicket::with(['pwdMember.user', 'messages'])
                    ->where('pwd_member_id', $pwdMember->id)
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            return response()->json($tickets);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch tickets'], 500);
        }
    }

    /**
     * Store a newly created support ticket.
     * Only PWD members can create tickets.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'PWDMember') {
                return response()->json(['error' => 'Only PWD members can create tickets'], 403);
            }

            $validator = Validator::make($request->all(), [
                'subject' => 'required|string|max:255',
                'description' => 'required|string',
                'priority' => 'nullable|in:low,medium,high,urgent',
                'category' => 'nullable|string|max:255',
                'attachment' => 'nullable|file|max:10240|mimes:pdf,doc,docx,txt,jpg,jpeg,png,gif'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $pwdMember = PWDMember::where('userID', $user->userID)->first();
            if (!$pwdMember) {
                return response()->json(['error' => 'PWD Member not found'], 404);
            }

            $ticket = SupportTicket::create([
                'ticket_number' => SupportTicket::generateTicketNumber(),
                'subject' => $request->subject,
                'description' => $request->description,
                'pwd_member_id' => $pwdMember->id,
                'priority' => $request->priority ?? 'medium',
                'category' => $request->category,
                'status' => 'open'
            ]);

            // Create initial message from PWD member
            $messageData = [
                'support_ticket_id' => $ticket->id,
                'message' => $request->description,
                'sender_type' => 'pwd_member',
                'sender_id' => $pwdMember->id
            ];

            // Handle file upload for initial message
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('support_attachments', $fileName, 'public');
                
                $messageData['attachment_path'] = $filePath;
                $messageData['attachment_name'] = $file->getClientOriginalName();
                $messageData['attachment_type'] = $file->getClientMimeType();
                $messageData['attachment_size'] = $file->getSize();
            }

            SupportTicketMessage::create($messageData);

            return response()->json([
                'message' => 'Support ticket created successfully',
                'ticket' => $ticket->load(['messages'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create ticket'], 500);
        }
    }

    /**
     * Display the specified support ticket.
     */
    public function show($id): JsonResponse
    {
        try {
            $user = Auth::user();
            $ticket = SupportTicket::with(['pwdMember.user', 'messages'])->find($id);

            if (!$ticket) {
                return response()->json(['error' => 'Ticket not found'], 404);
            }

            // Check permissions
            if ($user->role === 'PWDMember') {
                $pwdMember = PWDMember::where('userID', $user->userID)->first();
                if (!$pwdMember || $ticket->pwd_member_id !== $pwdMember->id) {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }
            }

            return response()->json($ticket);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch ticket'], 500);
        }
    }

    /**
     * Update the specified support ticket.
     * Only admin can update ticket status, PWD members can only mark as resolved/closed.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $ticket = SupportTicket::find($id);

            if (!$ticket) {
                return response()->json(['error' => 'Ticket not found'], 404);
            }

            if ($user->role === 'Admin') {
                // Admin can update status and priority
                $validator = Validator::make($request->all(), [
                    'status' => 'nullable|in:open,in_progress,resolved,closed',
                    'priority' => 'nullable|in:low,medium,high,urgent'
                ]);

                if ($validator->fails()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }

                $updateData = [];
                if ($request->has('status')) {
                    $updateData['status'] = $request->status;
                    if ($request->status === 'resolved') {
                        $updateData['resolved_at'] = now();
                    } elseif ($request->status === 'closed') {
                        $updateData['closed_at'] = now();
                    }
                }
                if ($request->has('priority')) {
                    $updateData['priority'] = $request->priority;
                }

                $ticket->update($updateData);

            } elseif ($user->role === 'PWDMember') {
                // PWD members can only mark their tickets as resolved or closed
                $pwdMember = PWDMember::where('userID', $user->userID)->first();
                if (!$pwdMember || $ticket->pwd_member_id !== $pwdMember->id) {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }

                $validator = Validator::make($request->all(), [
                    'status' => 'required|in:resolved,closed'
                ]);

                if ($validator->fails()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }

                $updateData = ['status' => $request->status];
                if ($request->status === 'resolved') {
                    $updateData['resolved_at'] = now();
                } elseif ($request->status === 'closed') {
                    $updateData['closed_at'] = now();
                }

                $ticket->update($updateData);
            } else {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            return response()->json([
                'message' => 'Ticket updated successfully',
                'ticket' => $ticket->load(['pwdMember', 'messages'])
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update ticket'], 500);
        }
    }

    /**
     * Remove the specified support ticket.
     * Only admin can delete tickets, and only if they are resolved or closed.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'Admin') {
                return response()->json(['error' => 'Only admin can delete tickets'], 403);
            }

            $ticket = SupportTicket::find($id);
            if (!$ticket) {
                return response()->json(['error' => 'Ticket not found'], 404);
            }

            if (!in_array($ticket->status, ['resolved', 'closed'])) {
                return response()->json(['error' => 'Can only delete resolved or closed tickets'], 400);
            }

            $ticket->delete();

            return response()->json(['message' => 'Ticket deleted successfully']);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete ticket'], 500);
        }
    }

    /**
     * Add a message to a support ticket.
     */
    public function addMessage(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $ticket = SupportTicket::find($id);

            if (!$ticket) {
                return response()->json(['error' => 'Ticket not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'message' => 'required|string',
                'attachment' => 'nullable|file|max:10240|mimes:pdf,doc,docx,txt,jpg,jpeg,png,gif'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $senderType = null;
            $senderId = null;

            if ($user->role === 'Admin') {
                $admin = Admin::where('userID', $user->userID)->first();
                if (!$admin) {
                    return response()->json(['error' => 'Admin not found'], 404);
                }
                $senderType = 'admin';
                $senderId = $admin->userID;
            } elseif ($user->role === 'PWDMember') {
                $pwdMember = PWDMember::where('userID', $user->userID)->first();
                if (!$pwdMember || $ticket->pwd_member_id !== $pwdMember->id) {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }
                $senderType = 'pwd_member';
                $senderId = $pwdMember->id;
            } else {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $messageData = [
                'support_ticket_id' => $ticket->id,
                'message' => $request->message,
                'sender_type' => $senderType,
                'sender_id' => $senderId
            ];

            // Handle file upload
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('support_attachments', $fileName, 'public');
                
                $messageData['attachment_path'] = $filePath;
                $messageData['attachment_name'] = $file->getClientOriginalName();
                $messageData['attachment_type'] = $file->getClientMimeType();
                $messageData['attachment_size'] = $file->getSize();
            }

            $message = SupportTicketMessage::create($messageData);

            // Update ticket status to in_progress if it was open
            if ($ticket->status === 'open') {
                $ticket->update(['status' => 'in_progress']);
            }

            // Create notification if admin is replying to PWD member
            if ($user->role === 'Admin') {
                $pwdMember = PWDMember::find($ticket->pwd_member_id);
                if ($pwdMember) {
                    Notification::create([
                        'user_id' => $pwdMember->userID,
                        'type' => 'support_ticket_reply',
                        'title' => 'New Reply to Your Support Ticket',
                        'message' => 'An admin has replied to your support ticket: "' . $ticket->subject . '"',
                        'data' => [
                            'ticket_id' => $ticket->id,
                            'ticket_number' => $ticket->ticket_number,
                            'ticket_subject' => $ticket->subject,
                            'admin_name' => $user->username ?? 'Admin'
                        ]
                    ]);
                }
            }

            return response()->json([
                'message' => 'Message added successfully',
                'ticket_message' => $message
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add message'], 500);
        }
    }

    /**
     * Download attachment from a support ticket message.
     */
    public function downloadAttachment($messageId): \Symfony\Component\HttpFoundation\Response|JsonResponse
    {
        try {
            // Try to get authenticated user (route is now public, so this might be null)
            $user = Auth::user();
            
            $message = SupportTicketMessage::with('supportTicket')->find($messageId);

            if (!$message) {
                return response()->json(['error' => 'Message not found'], 404);
            }

            // Check permissions if user is authenticated
            if ($user) {
                if ($user->role === 'PWDMember') {
                    $pwdMember = PWDMember::where('userID', $user->userID)->first();
                    if (!$pwdMember || $message->supportTicket->pwd_member_id !== $pwdMember->id) {
                        return response()->json(['error' => 'Unauthorized'], 403);
                    }
                }
                // Admin users can access any file
            } else {
                // For unauthenticated requests (direct URL access), allow access
                // This is for file preview functionality
            }

            if (!$message->hasAttachment()) {
                return response()->json(['error' => 'No attachment found'], 404);
            }

            $filePath = storage_path('app/public/' . $message->attachment_path);
            
            // Log detailed file path information
            \Log::info('Support ticket file path details', [
                'message_id' => $messageId,
                'attachment_path' => $message->attachment_path,
                'full_file_path' => $filePath,
                'file_exists' => file_exists($filePath),
                'storage_path' => storage_path('app/public/'),
                'attachment_name' => $message->attachment_name
            ]);
            
            if (!file_exists($filePath)) {
                \Log::error('Support ticket file not found at original path', [
                    'message_id' => $messageId,
                    'expected_path' => $filePath,
                    'attachment_path' => $message->attachment_path
                ]);
                
                // Try alternative path in support_attachments directory
                $alternativePath = storage_path('app/public/support_attachments/' . $message->attachment_name);
                if (file_exists($alternativePath)) {
                    \Log::info('Found file at alternative path', [
                        'message_id' => $messageId,
                        'alternative_path' => $alternativePath
                    ]);
                    $filePath = $alternativePath;
                } else {
                    \Log::error('Support ticket file not found at alternative path either', [
                        'message_id' => $messageId,
                        'alternative_path' => $alternativePath
                    ]);
                    return response()->json(['error' => 'File not found'], 404);
                }
            }

            // Get file info
            $fileSize = filesize($filePath);
            $mimeType = $message->attachment_type ?: mime_content_type($filePath);
            $fileName = $message->attachment_name;
            $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            
            // Log file info for debugging
            \Log::info('Support ticket file preview', [
                'message_id' => $messageId,
                'file_name' => $fileName,
                'file_extension' => $fileExtension,
                'mime_type' => $mimeType,
                'file_size' => $fileSize
            ]);
            
            // Set headers for inline viewing (same as document management)
            $headers = [
                'Content-Type' => $mimeType,
                'Content-Length' => $fileSize,
                'Content-Disposition' => 'inline; filename="' . $fileName . '"',
                'Cache-Control' => 'private, max-age=3600',
                'Pragma' => 'private',
                'Accept-Ranges' => 'bytes',
                'X-Content-Type-Options' => 'nosniff'
            ];

            // Return file response with proper headers (same as document management)
            return response()->file($filePath, $headers);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to download attachment'], 500);
        }
    }

    /**
     * Force download attachment from a support ticket message.
     */
    public function forceDownloadAttachment($messageId): \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
    {
        try {
            $user = Auth::user();
            $message = SupportTicketMessage::with('supportTicket')->find($messageId);

            if (!$message) {
                return response()->json(['error' => 'Message not found'], 404);
            }

            // Check permissions
            if ($user->role === 'PWDMember') {
                $pwdMember = PWDMember::where('userID', $user->userID)->first();
                if (!$pwdMember || $message->supportTicket->pwd_member_id !== $pwdMember->id) {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }
            }

            if (!$message->hasAttachment()) {
                return response()->json(['error' => 'No attachment found'], 404);
            }

            $filePath = storage_path('app/public/' . $message->attachment_path);
            
            if (!file_exists($filePath)) {
                return response()->json(['error' => 'File not found'], 404);
            }

            return response()->download($filePath, $message->attachment_name);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to download attachment'], 500);
        }
    }
}
