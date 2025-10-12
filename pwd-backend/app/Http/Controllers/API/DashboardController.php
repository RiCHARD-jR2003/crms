<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Test method
     */
    public function test()
    {
        return response()->json(['message' => 'DashboardController is working']);
    }

    /**
     * Get recent activities for admin dashboard
     */
    public function getRecentActivities()
    {
        try {
            // Return mock data for now
            $activities = [
                [
                    'id' => 1,
                    'type' => 'application',
                    'title' => 'New PWD Application',
                    'description' => 'Application from Juan Dela Cruz',
                    'status' => 'pending',
                    'barangay' => 'Banaybanay',
                    'created_at' => now()->subMinutes(30),
                    'icon' => 'person_add',
                    'color' => '#F39C12'
                ],
                [
                    'id' => 2,
                    'type' => 'announcement',
                    'title' => 'New Announcement',
                    'description' => 'Monthly PWD Meeting Schedule',
                    'status' => 'published',
                    'barangay' => 'All',
                    'created_at' => now()->subHours(2),
                    'icon' => 'campaign',
                    'color' => '#3498DB'
                ],
                [
                    'id' => 3,
                    'type' => 'application',
                    'title' => 'New PWD Application',
                    'description' => 'Application from Maria Santos',
                    'status' => 'approved',
                    'barangay' => 'Banlic',
                    'created_at' => now()->subHours(4),
                    'icon' => 'person_add',
                    'color' => '#27AE60'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $activities
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get barangay contacts for coordination table
     */
    public function getBarangayContacts()
    {
        try {
            // Get barangay presidents with their user information and contact details
            $barangayPresidents = \App\Models\BarangayPresident::with('user')
                ->whereNotNull('barangay')
                ->get();

            $contacts = [];

            foreach ($barangayPresidents as $president) {
                // Get PWD count for this barangay
                $pwdCount = \App\Models\PWDMember::where('barangay', $president->barangay)->count();
                
                // Get pending applications for this barangay
                $pendingApplications = \App\Models\Application::where('barangay', $president->barangay)
                    ->whereIn('status', ['Pending Barangay Approval', 'Pending Admin Approval'])
                    ->count();

                $contacts[] = [
                    'barangay' => $president->barangay,
                    'president_name' => $president->user->username ?? 'Unknown',
                    'email' => $president->email ?? $president->user->email ?? 'No email',
                    'phone' => $president->contact_number ?? 'No contact number',
                    'address' => "Barangay {$president->barangay}, Cabuyao City, Laguna",
                    'pwd_count' => $pwdCount,
                    'pending_applications' => $pendingApplications,
                    'status' => $president->user->status ?? 'active'
                ];
            }

            // If no barangay presidents found, return empty array
            if (empty($contacts)) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $contacts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch barangay contacts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get status color for applications
     */
    private function getStatusColor($status)
    {
        switch (strtolower($status)) {
            case 'approved':
                return '#27AE60';
            case 'pending':
                return '#F39C12';
            case 'rejected':
                return '#E74C3C';
            default:
                return '#7F8C8D';
        }
    }

    /**
     * Get status color for support tickets
     */
    private function getTicketStatusColor($status)
    {
        switch ($status) {
            case 'open':
                return '#E74C3C';
            case 'in_progress':
                return '#F39C12';
            case 'resolved':
                return '#27AE60';
            case 'closed':
                return '#7F8C8D';
            default:
                return '#7F8C8D';
        }
    }
}
