<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SecurityEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class SecurityMonitoringController extends Controller
{
    /**
     * Get all security events with filters
     */
    public function index(Request $request)
    {
        $query = SecurityEvent::with('user');

        // Filter by event type
        if ($request->has('event_type') && $request->event_type) {
            $query->where('event_type', $request->event_type);
        }

        // Filter by severity
        if ($request->has('severity') && $request->severity) {
            $query->where('severity', $request->severity);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by IP address
        if ($request->has('ip_address') && $request->ip_address) {
            $query->where('ip_address', 'LIKE', '%' . $request->ip_address . '%');
        }

        // Filter by date range
        if ($request->has('start_date') && $request->start_date) {
            $query->where('detected_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date) {
            $query->where('detected_at', '<=', $request->end_date);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'LIKE', '%' . $search . '%')
                  ->orWhere('detected_pattern', 'LIKE', '%' . $search . '%')
                  ->orWhere('url', 'LIKE', '%' . $search . '%')
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('username', 'LIKE', '%' . $search . '%')
                                ->orWhere('email', 'LIKE', '%' . $search . '%');
                  });
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'detected_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 50);
        $events = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'events' => $events->items(),
            'pagination' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ]
        ]);
    }

    /**
     * Get security statistics
     */
    public function getStatistics()
    {
        $stats = Cache::remember('security_statistics', now()->addMinutes(5), function () {
            $totalEvents = SecurityEvent::count();
            
            // Severity breakdown
            $criticalEvents = SecurityEvent::where('severity', 'critical')->count();
            $highEvents = SecurityEvent::where('severity', 'high')->count();
            $mediumEvents = SecurityEvent::where('severity', 'medium')->count();
            $lowEvents = SecurityEvent::where('severity', 'low')->count();
            
            // Status breakdown
            $pendingEvents = SecurityEvent::where('status', 'pending')->count();
            $investigatedEvents = SecurityEvent::where('status', 'investigated')->count();
            $resolvedEvents = SecurityEvent::where('status', 'resolved')->count();
            $falsePositiveEvents = SecurityEvent::where('status', 'false_positive')->count();
            
            // Events by type
            $eventsByType = SecurityEvent::selectRaw('event_type, COUNT(*) as count')
                ->groupBy('event_type')
                ->orderBy('count', 'desc')
                ->get()
                ->map(function($item) {
                    return [
                        'name' => str_replace('_', ' ', $item->event_type),
                        'value' => $item->count
                    ];
                });
            
            // Monthly events (last 6 months)
            $monthlyEvents = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $startOfMonth = $date->copy()->startOfMonth();
                $endOfMonth = $date->copy()->endOfMonth();
                
                $count = SecurityEvent::whereBetween('detected_at', [$startOfMonth, $endOfMonth])->count();
                $monthlyEvents[] = [
                    'month' => $date->format('M Y'),
                    'events' => $count
                ];
            }
            
            // Events by severity (for pie chart)
            $eventsBySeverity = [
                ['name' => 'Critical', 'value' => $criticalEvents],
                ['name' => 'High', 'value' => $highEvents],
                ['name' => 'Medium', 'value' => $mediumEvents],
                ['name' => 'Low', 'value' => $lowEvents],
            ];
            
            // Events by status (for pie chart)
            $eventsByStatus = [
                ['name' => 'Pending', 'value' => $pendingEvents],
                ['name' => 'Investigated', 'value' => $investigatedEvents],
                ['name' => 'Resolved', 'value' => $resolvedEvents],
                ['name' => 'False Positive', 'value' => $falsePositiveEvents],
            ];
            
            // Top IPs
            $topIps = SecurityEvent::selectRaw('ip_address, COUNT(*) as count')
                ->whereNotNull('ip_address')
                ->groupBy('ip_address')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get()
                ->map(function($item) {
                    return [
                        'name' => $item->ip_address,
                        'value' => $item->count
                    ];
                });
            
            // Calculate security rating (0-100 scale)
            // Rating decreases with more critical/high events and unresolved events
            $securityRating = 100;
            if ($totalEvents > 0) {
                // Deduct points for critical events (more weight)
                $criticalPenalty = min(($criticalEvents / max($totalEvents, 1)) * 50, 50);
                // Deduct points for high events
                $highPenalty = min(($highEvents / max($totalEvents, 1)) * 30, 30);
                // Deduct points for pending events
                $pendingPenalty = min(($pendingEvents / max($totalEvents, 1)) * 20, 20);
                
                $securityRating = max(0, 100 - $criticalPenalty - $highPenalty - $pendingPenalty);
            }
            
            // Resolution rate
            $resolvedTotal = $resolvedEvents + $falsePositiveEvents;
            $resolutionRate = $totalEvents > 0 ? ($resolvedTotal / $totalEvents) * 100 : 0;
            
            return [
                'total_events' => $totalEvents,
                'critical_events' => $criticalEvents,
                'high_events' => $highEvents,
                'medium_events' => $mediumEvents,
                'low_events' => $lowEvents,
                'pending_events' => $pendingEvents,
                'investigated_events' => $investigatedEvents,
                'resolved_events' => $resolvedEvents,
                'false_positive_events' => $falsePositiveEvents,
                'events_by_type' => $eventsByType,
                'events_by_severity' => $eventsBySeverity,
                'events_by_status' => $eventsByStatus,
                'monthly_events' => $monthlyEvents,
                'top_ips' => $topIps,
                'events_last_24h' => SecurityEvent::where('detected_at', '>=', now()->subDay())->count(),
                'events_last_7d' => SecurityEvent::where('detected_at', '>=', now()->subDays(7))->count(),
                'events_last_30d' => SecurityEvent::where('detected_at', '>=', now()->subDays(30))->count(),
                'security_rating' => round($securityRating, 1),
                'resolution_rate' => round($resolutionRate, 1),
            ];
        });

        return response()->json([
            'success' => true,
            'statistics' => $stats
        ]);
    }

    /**
     * Update event status
     */
    public function updateStatus(Request $request, $eventId)
    {
        $request->validate([
            'status' => 'required|in:pending,investigated,resolved,false_positive'
        ]);

        $event = SecurityEvent::findOrFail($eventId);
        $event->status = $request->status;
        $event->save();

        // Clear cache
        Cache::forget('security_statistics');

        return response()->json([
            'success' => true,
            'message' => 'Event status updated successfully',
            'event' => $event
        ]);
    }

    /**
     * Get event details
     */
    public function show($eventId)
    {
        $event = SecurityEvent::with('user')->findOrFail($eventId);

        return response()->json([
            'success' => true,
            'event' => $event
        ]);
    }

    /**
     * Bulk update event statuses
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'event_ids' => 'required|array',
            'event_ids.*' => 'exists:security_events,eventID',
            'status' => 'required|in:pending,investigated,resolved,false_positive'
        ]);

        SecurityEvent::whereIn('eventID', $request->event_ids)
            ->update(['status' => $request->status]);

        // Clear cache
        Cache::forget('security_statistics');

        return response()->json([
            'success' => true,
            'message' => 'Events status updated successfully',
            'updated_count' => count($request->event_ids)
        ]);
    }

    /**
     * Delete events (only resolved or false_positive)
     */
    public function deleteEvents(Request $request)
    {
        $request->validate([
            'event_ids' => 'required|array',
            'event_ids.*' => 'exists:security_events,eventID'
        ]);

        $events = SecurityEvent::whereIn('eventID', $request->event_ids)
            ->whereIn('status', ['resolved', 'false_positive'])
            ->delete();

        // Clear cache
        Cache::forget('security_statistics');

        return response()->json([
            'success' => true,
            'message' => 'Events deleted successfully',
            'deleted_count' => $events
        ]);
    }
}
