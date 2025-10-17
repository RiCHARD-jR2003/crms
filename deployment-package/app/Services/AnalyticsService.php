<?php

namespace App\Services;

use App\Models\PWDMember;
use App\Models\Application;
use App\Models\BenefitClaim;
use App\Models\Complaint;
use App\Models\SupportTicket;
use App\Models\Announcement;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Generate automated suggestions based on system analysis
     */
    public function generateAutomatedSuggestions($dateRange = null, $barangay = null)
    {
        $suggestions = [];
        
        // Analyze transaction patterns
        $transactionAnalysis = $this->analyzeTransactionPatterns($dateRange, $barangay);
        
        // Generate suggestions for each category
        $suggestions['applications'] = $this->generateApplicationSuggestions($transactionAnalysis['applications']);
        $suggestions['benefits'] = $this->generateBenefitSuggestions($transactionAnalysis['benefits']);
        $suggestions['complaints'] = $this->generateComplaintSuggestions($transactionAnalysis['complaints']);
        $suggestions['support'] = $this->generateSupportSuggestions($transactionAnalysis['support']);
        $suggestions['registrations'] = $this->generateRegistrationSuggestions($transactionAnalysis['registrations']);
        
        // Generate overall system suggestions
        $suggestions['system'] = $this->generateSystemSuggestions($transactionAnalysis);
        
        return [
            'suggestions' => $suggestions,
            'analysis' => $transactionAnalysis,
            'generated_at' => now(),
            'analysis_period' => $dateRange,
            'barangay_filter' => $barangay
        ];
    }
    
    /**
     * Analyze transaction patterns across the system
     */
    private function analyzeTransactionPatterns($dateRange = null, $barangay = null)
    {
        $startDate = $dateRange ? Carbon::parse($dateRange['start']) : Carbon::now()->subMonth();
        $endDate = $dateRange ? Carbon::parse($dateRange['end']) : Carbon::now();
        
        $analysis = [];
        
        // Application patterns
        $analysis['applications'] = $this->analyzeApplications($startDate, $endDate, $barangay);
        
        // Benefit claim patterns
        $analysis['benefits'] = $this->analyzeBenefitClaims($startDate, $endDate, $barangay);
        
        // Complaint patterns
        $analysis['complaints'] = $this->analyzeComplaints($startDate, $endDate, $barangay);
        
        // Support ticket patterns
        $analysis['support'] = $this->analyzeSupportTickets($startDate, $endDate, $barangay);
        
        // Registration patterns
        $analysis['registrations'] = $this->analyzeRegistrations($startDate, $endDate, $barangay);
        
        return $analysis;
    }
    
    /**
     * Analyze application patterns
     */
    private function analyzeApplications($startDate, $endDate, $barangay = null)
    {
        $query = Application::whereBetween('submissionDate', [$startDate, $endDate]);
        
        if ($barangay) {
            $query->where('barangay', $barangay);
        }
        
        $total = $query->count();
        $approved = $query->clone()->where('status', 'Approved')->count();
        $pending = $query->clone()->where('status', 'Pending')->count();
        $rejected = $query->clone()->where('status', 'Rejected')->count();
        
        $approvalRate = $total > 0 ? ($approved / $total) * 100 : 0;
        $pendingRate = $total > 0 ? ($pending / $total) * 100 : 0;
        $rejectionRate = $total > 0 ? ($rejected / $total) * 100 : 0;
        
        // Calculate average processing time
        $avgProcessingTime = $query->clone()
            ->whereNotNull('approvalDate')
            ->selectRaw('AVG(DATEDIFF(approvalDate, submissionDate)) as avg_days')
            ->value('avg_days') ?? 0;
        
        return [
            'total' => $total,
            'approved' => $approved,
            'pending' => $pending,
            'rejected' => $rejected,
            'approval_rate' => round($approvalRate, 2),
            'pending_rate' => round($pendingRate, 2),
            'rejection_rate' => round($rejectionRate, 2),
            'avg_processing_time' => round($avgProcessingTime, 2),
            'daily_average' => round($total / $startDate->diffInDays($endDate), 2)
        ];
    }
    
    /**
     * Analyze benefit claim patterns
     */
    private function analyzeBenefitClaims($startDate, $endDate, $barangay = null)
    {
        $query = BenefitClaim::whereBetween('created_at', [$startDate, $endDate]);
        
        if ($barangay) {
            $query->whereHas('pwdMember', function($q) use ($barangay) {
                $q->whereHas('applications', function($appQuery) use ($barangay) {
                    $appQuery->where('barangay', $barangay);
                });
            });
        }
        
        $total = $query->count();
        $claimed = $query->clone()->where('status', 'Claimed')->count();
        $pending = $query->clone()->where('status', 'Pending')->count();
        
        $claimRate = $total > 0 ? ($claimed / $total) * 100 : 0;
        
        // Analyze claim types
        $claimTypes = $query->clone()
            ->select('benefit_id', DB::raw('COUNT(*) as count'))
            ->groupBy('benefit_id')
            ->get();
        
        return [
            'total' => $total,
            'claimed' => $claimed,
            'pending' => $pending,
            'claim_rate' => round($claimRate, 2),
            'claim_types' => $claimTypes,
            'daily_average' => round($total / $startDate->diffInDays($endDate), 2)
        ];
    }
    
    /**
     * Analyze complaint patterns
     */
    private function analyzeComplaints($startDate, $endDate, $barangay = null)
    {
        $query = Complaint::whereBetween('created_at', [$startDate, $endDate]);
        
        if ($barangay) {
            $query->whereHas('user.pwdMember', function($q) use ($barangay) {
                $q->whereHas('applications', function($appQuery) use ($barangay) {
                    $appQuery->where('barangay', $barangay);
                });
            });
        }
        
        $total = $query->count();
        $resolved = $query->clone()->where('status', 'Resolved')->count();
        $pending = $query->clone()->where('status', 'Pending')->count();
        
        $resolutionRate = $total > 0 ? ($resolved / $total) * 100 : 0;
        
        // Analyze complaint categories
        $categories = $query->clone()
            ->select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->get();
        
        return [
            'total' => $total,
            'resolved' => $resolved,
            'pending' => $pending,
            'resolution_rate' => round($resolutionRate, 2),
            'categories' => $categories,
            'daily_average' => round($total / $startDate->diffInDays($endDate), 2)
        ];
    }
    
    /**
     * Analyze support ticket patterns
     */
    private function analyzeSupportTickets($startDate, $endDate, $barangay = null)
    {
        $query = SupportTicket::whereBetween('created_at', [$startDate, $endDate]);
        
        $total = $query->count();
        $closed = $query->clone()->where('status', 'closed')->count();
        $open = $query->clone()->where('status', 'open')->count();
        
        $closureRate = $total > 0 ? ($closed / $total) * 100 : 0;
        
        // Calculate average response time
        $avgResponseTime = $query->clone()
            ->whereHas('messages')
            ->join('support_ticket_messages', 'support_tickets.id', '=', 'support_ticket_messages.support_ticket_id')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, support_tickets.created_at, support_ticket_messages.created_at)) as avg_hours')
            ->value('avg_hours') ?? 0;
        
        return [
            'total' => $total,
            'closed' => $closed,
            'open' => $open,
            'closure_rate' => round($closureRate, 2),
            'avg_response_time' => round($avgResponseTime, 2),
            'daily_average' => round($total / $startDate->diffInDays($endDate), 2)
        ];
    }
    
    /**
     * Analyze PWD registration patterns
     */
    private function analyzeRegistrations($startDate, $endDate, $barangay = null)
    {
        $query = PWDMember::whereBetween('created_at', [$startDate, $endDate]);
        
        if ($barangay) {
            $query->whereHas('applications', function($q) use ($barangay) {
                $q->where('barangay', $barangay);
            });
        }
        
        $total = $query->count();
        
        // Analyze disability types
        $disabilityTypes = $query->clone()
            ->select('disabilityType', DB::raw('COUNT(*) as count'))
            ->groupBy('disabilityType')
            ->get();
        
        // Analyze age groups
        $ageGroups = $query->clone()
            ->selectRaw('
                CASE 
                    WHEN TIMESTAMPDIFF(YEAR, birthDate, CURDATE()) < 18 THEN "Under 18"
                    WHEN TIMESTAMPDIFF(YEAR, birthDate, CURDATE()) BETWEEN 18 AND 35 THEN "18-35"
                    WHEN TIMESTAMPDIFF(YEAR, birthDate, CURDATE()) BETWEEN 36 AND 55 THEN "36-55"
                    ELSE "Over 55"
                END as age_group,
                COUNT(*) as count
            ')
            ->groupBy('age_group')
            ->get();
        
        return [
            'total' => $total,
            'disability_types' => $disabilityTypes,
            'age_groups' => $ageGroups,
            'daily_average' => round($total / $startDate->diffInDays($endDate), 2)
        ];
    }
    
    /**
     * Generate application-specific suggestions
     */
    private function generateApplicationSuggestions($applicationData)
    {
        $suggestions = [];
        
        // Low approval rate
        if ($applicationData['approval_rate'] < 70) {
            $suggestions[] = [
                'type' => 'improvement',
                'priority' => 'high',
                'category' => 'Application Processing',
                'title' => 'Low Application Approval Rate Detected',
                'description' => "Current approval rate is {$applicationData['approval_rate']}%, which is below the recommended 70% threshold.",
                'recommendations' => [
                    'Review application requirements and ensure they are clear and achievable',
                    'Provide better guidance to applicants during the submission process',
                    'Consider implementing a pre-screening process to catch issues early',
                    'Train staff on consistent evaluation criteria'
                ],
                'expected_impact' => 'Increase approval rate by 15-20%',
                'implementation_difficulty' => 'Medium',
                'estimated_timeframe' => '2-4 weeks'
            ];
        }
        
        // High pending rate
        if ($applicationData['pending_rate'] > 30) {
            $suggestions[] = [
                'type' => 'efficiency',
                'priority' => 'high',
                'category' => 'Processing Speed',
                'title' => 'High Pending Application Backlog',
                'description' => "Currently {$applicationData['pending_rate']}% of applications are pending, indicating a processing bottleneck.",
                'recommendations' => [
                    'Increase processing staff or redistribute workload',
                    'Implement automated initial screening checks',
                    'Set up daily processing targets for staff',
                    'Create expedited processing for complete applications'
                ],
                'expected_impact' => 'Reduce pending rate to under 20%',
                'implementation_difficulty' => 'Medium',
                'estimated_timeframe' => '1-2 weeks'
            ];
        }
        
        // Long processing time
        if ($applicationData['avg_processing_time'] > 15) {
            $suggestions[] = [
                'type' => 'efficiency',
                'priority' => 'medium',
                'category' => 'Processing Time',
                'title' => 'Extended Application Processing Time',
                'description' => "Average processing time is {$applicationData['avg_processing_time']} days, exceeding the 15-day target.",
                'recommendations' => [
                    'Streamline the review process by removing unnecessary steps',
                    'Implement digital workflows to reduce manual handling',
                    'Set up automated status notifications for applicants',
                    'Create processing milestones with deadlines'
                ],
                'expected_impact' => 'Reduce processing time by 5-7 days',
                'implementation_difficulty' => 'High',
                'estimated_timeframe' => '4-6 weeks'
            ];
        }
        
        // Low application volume
        if ($applicationData['daily_average'] < 2) {
            $suggestions[] = [
                'type' => 'outreach',
                'priority' => 'medium',
                'category' => 'Service Utilization',
                'title' => 'Low Application Volume',
                'description' => "Daily average of {$applicationData['daily_average']} applications suggests potential underutilization of services.",
                'recommendations' => [
                    'Increase awareness campaigns in the community',
                    'Partner with local organizations to reach more PWDs',
                    'Simplify the application process and requirements',
                    'Provide multilingual support and assistance'
                ],
                'expected_impact' => 'Increase application volume by 30-50%',
                'implementation_difficulty' => 'Medium',
                'estimated_timeframe' => '3-5 weeks'
            ];
        }
        
        return $suggestions;
    }
    
    /**
     * Generate benefit-specific suggestions
     */
    private function generateBenefitSuggestions($benefitData)
    {
        $suggestions = [];
        
        // Low claim rate
        if ($benefitData['claim_rate'] < 50) {
            $suggestions[] = [
                'type' => 'utilization',
                'priority' => 'high',
                'category' => 'Benefit Utilization',
                'title' => 'Low Benefit Claim Rate',
                'description' => "Only {$benefitData['claim_rate']}% of available benefits are being claimed, indicating underutilization.",
                'recommendations' => [
                    'Conduct awareness campaigns about available benefits',
                    'Simplify the benefit claiming process',
                    'Provide clear instructions and assistance for benefit claims',
                    'Send periodic reminders to eligible PWD members',
                    'Create mobile-friendly claim processes'
                ],
                'expected_impact' => 'Increase claim rate by 20-30%',
                'implementation_difficulty' => 'Low',
                'estimated_timeframe' => '2-3 weeks'
            ];
        }
        
        // High pending claims
        if ($benefitData['pending'] > $benefitData['total'] * 0.4) {
            $suggestions[] = [
                'type' => 'efficiency',
                'priority' => 'high',
                'category' => 'Claim Processing',
                'title' => 'High Pending Benefit Claims',
                'description' => "Large number of pending benefit claims may indicate processing delays.",
                'recommendations' => [
                    'Implement automated eligibility verification',
                    'Set up digital approval workflows',
                    'Increase processing staff during peak periods',
                    'Create priority processing for urgent claims'
                ],
                'expected_impact' => 'Reduce pending claims by 40-50%',
                'implementation_difficulty' => 'Medium',
                'estimated_timeframe' => '3-4 weeks'
            ];
        }
        
        // Low daily volume
        if ($benefitData['daily_average'] < 1) {
            $suggestions[] = [
                'type' => 'promotion',
                'priority' => 'medium',
                'category' => 'Service Promotion',
                'title' => 'Low Daily Benefit Claims',
                'description' => "Low daily average of benefit claims suggests need for better promotion.",
                'recommendations' => [
                    'Create targeted marketing campaigns for specific benefits',
                    'Partner with healthcare providers and social workers',
                    'Develop educational materials about benefit eligibility',
                    'Implement referral programs from other services'
                ],
                'expected_impact' => 'Increase daily claims by 100-150%',
                'implementation_difficulty' => 'Medium',
                'estimated_timeframe' => '4-6 weeks'
            ];
        }
        
        return $suggestions;
    }
    
    /**
     * Generate complaint-specific suggestions
     */
    private function generateComplaintSuggestions($complaintData)
    {
        $suggestions = [];
        
        // Low resolution rate
        if ($complaintData['resolution_rate'] < 80) {
            $suggestions[] = [
                'type' => 'service_quality',
                'priority' => 'high',
                'category' => 'Complaint Resolution',
                'title' => 'Low Complaint Resolution Rate',
                'description' => "Resolution rate of {$complaintData['resolution_rate']}% is below the 80% target, indicating service quality issues.",
                'recommendations' => [
                    'Implement standardized complaint resolution procedures',
                    'Train staff on effective complaint handling techniques',
                    'Set up escalation procedures for complex complaints',
                    'Create feedback loops to prevent recurring issues',
                    'Establish resolution time targets'
                ],
                'expected_impact' => 'Improve resolution rate to 85-90%',
                'implementation_difficulty' => 'Medium',
                'estimated_timeframe' => '3-5 weeks'
            ];
        }
        
        // High complaint volume
        if ($complaintData['daily_average'] > 3) {
            $suggestions[] = [
                'type' => 'prevention',
                'priority' => 'high',
                'category' => 'Issue Prevention',
                'title' => 'High Complaint Volume',
                'description' => "High daily complaint average suggests systemic issues that need addressing.",
                'recommendations' => [
                    'Analyze complaint patterns to identify root causes',
                    'Implement proactive quality control measures',
                    'Improve initial service delivery to prevent complaints',
                    'Create user education programs to set proper expectations',
                    'Regular staff training on service excellence'
                ],
                'expected_impact' => 'Reduce complaints by 25-35%',
                'implementation_difficulty' => 'High',
                'estimated_timeframe' => '6-8 weeks'
            ];
        }
        
        return $suggestions;
    }
    
    /**
     * Generate support-specific suggestions
     */
    private function generateSupportSuggestions($supportData)
    {
        $suggestions = [];
        
        // Low closure rate
        if ($supportData['closure_rate'] < 75) {
            $suggestions[] = [
                'type' => 'support_efficiency',
                'priority' => 'medium',
                'category' => 'Support Quality',
                'title' => 'Low Support Ticket Closure Rate',
                'description' => "Support ticket closure rate of {$supportData['closure_rate']}% indicates potential support quality issues.",
                'recommendations' => [
                    'Implement better ticket tracking and follow-up systems',
                    'Provide additional training for support staff',
                    'Create knowledge base for common issues',
                    'Set up automated reminders for pending tickets',
                    'Implement customer satisfaction surveys'
                ],
                'expected_impact' => 'Improve closure rate to 85-90%',
                'implementation_difficulty' => 'Medium',
                'estimated_timeframe' => '2-4 weeks'
            ];
        }
        
        // Slow response time
        if ($supportData['avg_response_time'] > 24) {
            $suggestions[] = [
                'type' => 'response_time',
                'priority' => 'high',
                'category' => 'Support Responsiveness',
                'title' => 'Slow Support Response Time',
                'description' => "Average response time of {$supportData['avg_response_time']} hours exceeds the 24-hour target.",
                'recommendations' => [
                    'Implement automated acknowledgment responses',
                    'Set up priority levels for different types of issues',
                    'Increase support staff during peak hours',
                    'Create templated responses for common questions',
                    'Implement notification systems for urgent tickets'
                ],
                'expected_impact' => 'Reduce response time to under 12 hours',
                'implementation_difficulty' => 'Low',
                'estimated_timeframe' => '1-2 weeks'
            ];
        }
        
        return $suggestions;
    }
    
    /**
     * Generate registration-specific suggestions
     */
    private function generateRegistrationSuggestions($registrationData)
    {
        $suggestions = [];
        
        // Low registration volume
        if ($registrationData['daily_average'] < 1.5) {
            $suggestions[] = [
                'type' => 'outreach',
                'priority' => 'medium',
                'category' => 'Registration Growth',
                'title' => 'Low PWD Registration Rate',
                'description' => "Daily average of {$registrationData['daily_average']} registrations suggests potential outreach opportunities.",
                'recommendations' => [
                    'Conduct community outreach programs in underserved areas',
                    'Partner with hospitals and rehabilitation centers',
                    'Implement mobile registration services',
                    'Create multilingual registration materials',
                    'Develop referral incentive programs'
                ],
                'expected_impact' => 'Increase registrations by 40-60%',
                'implementation_difficulty' => 'Medium',
                'estimated_timeframe' => '4-6 weeks'
            ];
        }
        
        // Uneven disability type distribution
        $totalTypes = count($registrationData['disability_types']);
        if ($totalTypes > 0) {
            $maxCount = $registrationData['disability_types']->max('count');
            $avgCount = $registrationData['total'] / $totalTypes;
            
            if ($maxCount > $avgCount * 2) {
                $suggestions[] = [
                    'type' => 'diversity',
                    'priority' => 'low',
                    'category' => 'Service Inclusivity',
                    'title' => 'Uneven Disability Type Representation',
                    'description' => "Some disability types are significantly underrepresented in registrations.",
                    'recommendations' => [
                        'Analyze barriers specific to underrepresented disability types',
                        'Create targeted outreach for specific disability communities',
                        'Ensure services are accessible to all disability types',
                        'Partner with specialized disability organizations',
                        'Review registration process for potential barriers'
                    ],
                    'expected_impact' => 'Improve service inclusivity by 20-30%',
                    'implementation_difficulty' => 'Medium',
                    'estimated_timeframe' => '6-8 weeks'
                ];
            }
        }
        
        return $suggestions;
    }
    
    /**
     * Generate overall system suggestions
     */
    private function generateSystemSuggestions($analysisData)
    {
        $suggestions = [];
        
        // Overall system performance
        $totalTransactions = $analysisData['applications']['total'] + 
                           $analysisData['benefits']['total'] + 
                           $analysisData['complaints']['total'] + 
                           $analysisData['support']['total'];
        
        if ($totalTransactions < 50) {
            $suggestions[] = [
                'type' => 'system_optimization',
                'priority' => 'medium',
                'category' => 'Overall Performance',
                'title' => 'Low Overall System Utilization',
                'description' => "Total system transactions are below expected levels, indicating potential for growth.",
                'recommendations' => [
                    'Implement comprehensive marketing strategy for all services',
                    'Create integrated service delivery approach',
                    'Develop user-friendly digital platforms',
                    'Establish community partnerships for service promotion',
                    'Implement data-driven service improvements'
                ],
                'expected_impact' => 'Increase overall system utilization by 30-50%',
                'implementation_difficulty' => 'High',
                'estimated_timeframe' => '8-12 weeks'
            ];
        }
        
        // Cross-service integration opportunities
        $applicationToRegistrationRatio = $analysisData['applications']['total'] / max($analysisData['registrations']['total'], 1);
        
        if ($applicationToRegistrationRatio < 0.8) {
            $suggestions[] = [
                'type' => 'integration',
                'priority' => 'medium',
                'category' => 'Service Integration',
                'title' => 'Service Integration Opportunity',
                'description' => "Gap between registrations and applications suggests integration opportunities.",
                'recommendations' => [
                    'Create seamless pathway from registration to benefit applications',
                    'Implement automated eligibility notifications',
                    'Develop integrated user dashboard for all services',
                    'Set up cross-service referral systems',
                    'Create unified communication strategy'
                ],
                'expected_impact' => 'Improve service conversion by 25-40%',
                'implementation_difficulty' => 'High',
                'estimated_timeframe' => '6-10 weeks'
            ];
        }
        
        return $suggestions;
    }
    
    /**
     * Get suggestion summary statistics
     */
    public function getSuggestionSummary($suggestions)
    {
        $summary = [
            'total_suggestions' => 0,
            'high_priority' => 0,
            'medium_priority' => 0,
            'low_priority' => 0,
            'categories' => [],
            'types' => []
        ];
        
        foreach ($suggestions as $category => $categoryItems) {
            foreach ($categoryItems as $suggestion) {
                $summary['total_suggestions']++;
                
                // Count by priority
                switch ($suggestion['priority']) {
                    case 'high':
                        $summary['high_priority']++;
                        break;
                    case 'medium':
                        $summary['medium_priority']++;
                        break;
                    case 'low':
                        $summary['low_priority']++;
                        break;
                }
                
                // Count by category
                $cat = $suggestion['category'];
                $summary['categories'][$cat] = ($summary['categories'][$cat] ?? 0) + 1;
                
                // Count by type
                $type = $suggestion['type'];
                $summary['types'][$type] = ($summary['types'][$type] ?? 0) + 1;
            }
        }
        
        return $summary;
    }
}
