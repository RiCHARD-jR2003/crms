<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PWDMember;
use App\Models\Application;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get monthly PWD registration statistics
     */
    public function getMonthlyStats(Request $request)
    {
        try {
            $year = $request->get('year', date('Y'));
            
            // Check if pwd_member table exists, if not use approved applications
            $monthlyData = collect();
            try {
                $monthlyData = PWDMember::select(
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('COUNT(*) as registered_count')
                )
                ->whereYear('created_at', $year)
                ->groupBy(DB::raw('MONTH(created_at)'))
                ->orderBy('month')
                ->get();
            } catch (\Exception $e) {
                // Table doesn't exist or has issues, use approved applications as PWD members
                $monthlyData = Application::select(
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('COUNT(*) as registered_count')
                )
                ->where('status', 'Approved')
                ->whereYear('created_at', $year)
                ->groupBy(DB::raw('MONTH(created_at)'))
                ->orderBy('month')
                ->get();
            }

            // Prepare the response data for all 12 months
            $months = [
                'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
            ];

            // Convert to array for easier access
            $monthlyArray = $monthlyData->pluck('registered_count', 'month')->toArray();
            
            $chartData = [];
            for ($i = 1; $i <= 12; $i++) {
                $chartData[] = [
                    'month' => $months[$i - 1],
                    'registered' => $monthlyArray[(string)$i] ?? 0
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $chartData,
                'year' => $year
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch monthly statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard overview statistics
     */
    public function getDashboardStats()
    {
        try {
            // Check if pwd_member table exists
            $pwdMemberCount = 0;
            try {
                $pwdMemberCount = PWDMember::count();
            } catch (\Exception $e) {
                // Table doesn't exist or has issues, use approved applications as PWD members
                $pwdMemberCount = Application::where('status', 'Approved')->count();
            }

            // Get support tickets count
            $supportTicketsCount = 0;
            try {
                $supportTicketsCount = \App\Models\SupportTicket::count();
                \Illuminate\Support\Facades\Log::info('Support tickets count:', ['count' => $supportTicketsCount]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error fetching support tickets count:', ['error' => $e->getMessage()]);
                // Table doesn't exist or has issues, use default value
                $supportTicketsCount = 0;
            }

            $stats = [
                'totalPWDMembers' => $pwdMemberCount,
                'pendingApplications' => Application::whereIn('status', ['Pending Barangay Approval', 'Pending Admin Approval'])->count(),
                'approvedApplications' => Application::where('status', 'Approved')->count(),
                'activeMembers' => $pwdMemberCount, // All PWD members are considered active
                'supportTickets' => $supportTicketsCount
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent activities
     */
    public function getRecentActivities()
    {
        try {
            $activities = Application::orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($app) {
                    return [
                        'id' => $app->applicationID,
                        'title' => 'New PWD Application',
                        'description' => "Application from {$app->firstName} {$app->lastName}",
                        'barangay' => $app->barangay,
                        'status' => $app->status === 'Approved' ? 'approved' : 'pending',
                        'icon' => 'person_add',
                        'color' => $app->status === 'Approved' ? '#27AE60' : '#F39C12',
                        'created_at' => $app->created_at
                    ];
                });

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
     * Get barangay coordination data
     */
    public function getBarangayCoordination()
    {
        try {
            // Get PWD members grouped by barangay (if table exists)
            $barangayStats = collect();
            try {
                $barangayStats = PWDMember::select(
                    'barangay',
                    DB::raw('COUNT(*) as pwd_count')
                )
                ->groupBy('barangay')
                ->get()
                ->keyBy('barangay');
            } catch (\Exception $e) {
                // Table doesn't exist or has issues, use empty collection
                $barangayStats = collect();
            }

            // Get pending applications per barangay
            $barangayPending = Application::select(
                'barangay',
                DB::raw('COUNT(*) as pending_count')
            )
            ->whereIn('status', ['Pending Barangay Approval', 'Pending Admin Approval'])
            ->groupBy('barangay')
            ->get()
            ->keyBy('barangay');

            // Combine the data
            $contacts = [];
            foreach ($barangayStats as $barangay => $stats) {
                $contacts[] = [
                    'barangay' => $barangay,
                    'pwd_count' => $stats->pwd_count,
                    'pending_applications' => $barangayPending->get($barangay)->pending_count ?? 0,
                    'president_name' => "President of {$barangay}",
                    'phone' => '+63 999 000 0000',
                    'email' => "president@" . strtolower(str_replace(' ', '', $barangay)) . ".com",
                    'status' => 'active'
                ];
            }

            // If no PWD members, get barangays from applications
            if (empty($contacts)) {
                $applicationBarangays = Application::select('barangay')
                    ->distinct()
                    ->whereNotNull('barangay')
                    ->get();
                
                foreach ($applicationBarangays as $app) {
                    $contacts[] = [
                        'barangay' => $app->barangay,
                        'pwd_count' => 0,
                        'pending_applications' => $barangayPending->get($app->barangay)->pending_count ?? 0,
                        'president_name' => "President of {$app->barangay}",
                        'phone' => '+63 999 000 0000',
                        'email' => "president@" . strtolower(str_replace(' ', '', $app->barangay)) . ".com",
                        'status' => 'active'
                    ];
                }
            }

            // Sort by barangay name
            usort($contacts, function ($a, $b) {
                return strcmp($a['barangay'], $b['barangay']);
            });

            return response()->json([
                'success' => true,
                'data' => $contacts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch barangay coordination data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
