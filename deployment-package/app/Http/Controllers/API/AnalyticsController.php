<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnalyticsController extends Controller
{
    protected $analyticsService;
    
    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }
    
    /**
     * Get automated suggestions based on system analysis
     */
    public function getAutomatedSuggestions(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'barangay' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }
            
            $dateRange = null;
            if ($request->start_date && $request->end_date) {
                $dateRange = [
                    'start' => $request->start_date,
                    'end' => $request->end_date
                ];
            }
            
            $result = $this->analyticsService->generateAutomatedSuggestions(
                $dateRange,
                $request->barangay
            );
            
            $summary = $this->analyticsService->getSuggestionSummary($result['suggestions']);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'suggestions' => $result['suggestions'],
                    'analysis' => $result['analysis'],
                    'summary' => $summary,
                    'metadata' => [
                        'generated_at' => $result['generated_at'],
                        'analysis_period' => $result['analysis_period'],
                        'barangay_filter' => $result['barangay_filter']
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate suggestions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get suggestions for a specific category
     */
    public function getCategorySuggestions(Request $request, $category)
    {
        try {
            $validator = Validator::make($request->all(), [
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'barangay' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }
            
            $dateRange = null;
            if ($request->start_date && $request->end_date) {
                $dateRange = [
                    'start' => $request->start_date,
                    'end' => $request->end_date
                ];
            }
            
            $result = $this->analyticsService->generateAutomatedSuggestions(
                $dateRange,
                $request->barangay
            );
            
            $validCategories = ['applications', 'benefits', 'complaints', 'support', 'registrations', 'system'];
            
            if (!in_array($category, $validCategories)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid category',
                    'valid_categories' => $validCategories
                ], 400);
            }
            
            $categorySuggestions = $result['suggestions'][$category] ?? [];
            
            return response()->json([
                'success' => true,
                'data' => [
                    'category' => $category,
                    'suggestions' => $categorySuggestions,
                    'count' => count($categorySuggestions),
                    'analysis_data' => $result['analysis'][$category] ?? null,
                    'metadata' => [
                        'generated_at' => $result['generated_at'],
                        'analysis_period' => $result['analysis_period'],
                        'barangay_filter' => $result['barangay_filter']
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate category suggestions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get suggestion summary statistics
     */
    public function getSuggestionSummary(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'barangay' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }
            
            $dateRange = null;
            if ($request->start_date && $request->end_date) {
                $dateRange = [
                    'start' => $request->start_date,
                    'end' => $request->end_date
                ];
            }
            
            $result = $this->analyticsService->generateAutomatedSuggestions(
                $dateRange,
                $request->barangay
            );
            
            $summary = $this->analyticsService->getSuggestionSummary($result['suggestions']);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'priority_breakdown' => [
                        'high' => $summary['high_priority'],
                        'medium' => $summary['medium_priority'],
                        'low' => $summary['low_priority']
                    ],
                    'category_breakdown' => $summary['categories'],
                    'type_breakdown' => $summary['types'],
                    'metadata' => [
                        'generated_at' => $result['generated_at'],
                        'analysis_period' => $result['analysis_period'],
                        'barangay_filter' => $result['barangay_filter']
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate suggestion summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get high priority suggestions only
     */
    public function getHighPrioritySuggestions(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'barangay' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }
            
            $dateRange = null;
            if ($request->start_date && $request->end_date) {
                $dateRange = [
                    'start' => $request->start_date,
                    'end' => $request->end_date
                ];
            }
            
            $result = $this->analyticsService->generateAutomatedSuggestions(
                $dateRange,
                $request->barangay
            );
            
            $highPrioritySuggestions = [];
            
            foreach ($result['suggestions'] as $category => $suggestions) {
                $highPrioritySuggestions[$category] = array_filter($suggestions, function($suggestion) {
                    return $suggestion['priority'] === 'high';
                });
            }
            
            // Remove empty categories
            $highPrioritySuggestions = array_filter($highPrioritySuggestions, function($suggestions) {
                return !empty($suggestions);
            });
            
            $count = array_sum(array_map('count', $highPrioritySuggestions));
            
            return response()->json([
                'success' => true,
                'data' => [
                    'high_priority_suggestions' => $highPrioritySuggestions,
                    'count' => $count,
                    'metadata' => [
                        'generated_at' => $result['generated_at'],
                        'analysis_period' => $result['analysis_period'],
                        'barangay_filter' => $result['barangay_filter']
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate high priority suggestions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get transaction analysis data
     */
    public function getTransactionAnalysis(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'barangay' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }
            
            $dateRange = null;
            if ($request->start_date && $request->end_date) {
                $dateRange = [
                    'start' => $request->start_date,
                    'end' => $request->end_date
                ];
            }
            
            $result = $this->analyticsService->generateAutomatedSuggestions(
                $dateRange,
                $request->barangay
            );
            
            return response()->json([
                'success' => true,
                'data' => [
                    'transaction_analysis' => $result['analysis'],
                    'metadata' => [
                        'generated_at' => $result['generated_at'],
                        'analysis_period' => $result['analysis_period'],
                        'barangay_filter' => $result['barangay_filter']
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate transaction analysis',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
