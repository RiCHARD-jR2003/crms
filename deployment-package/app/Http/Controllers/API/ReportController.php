<?php
// app/Http/Controllers/API/ReportController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    public function index()
    {
        $reports = Report::with('admin.user')->get();
        return response()->json($reports);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'generatedBy' => 'required|exists:admins,userID',
            'reportType' => 'required|string|max:50',
            'generationDate' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $report = Report::create($request->all());

        return response()->json($report->load('admin.user'), 201);
    }

    public function show($id)
    {
        $report = Report::with('admin.user')->find($id);
        
        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }
        
        return response()->json($report);
    }

    public function update(Request $request, $id)
    {
        $report = Report::find($id);
        
        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'reportType' => 'sometimes|required|string|max:50',
            'generationDate' => 'sometimes|required|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $report->update($request->only(['reportType', 'generationDate']));

        return response()->json($report->load('admin.user'));
    }

    public function destroy($id)
    {
        $report = Report::find($id);
        
        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $report->delete();

        return response()->json(['message' => 'Report deleted successfully']);
    }

    public function generateReport(Request $request, $type)
    {
        // This would typically generate a specific type of report
        // For now, we'll just return a success message
        return response()->json([
            'message' => "Report of type {$type} generated successfully",
            'reportType' => $type,
            'generatedBy' => $request->user()->userID,
            'generationDate' => now()->toDateString(),
        ]);
    }

    public function getBarangayStats(Request $request, $barangay)
    {
        try {
            $stats = [
                'total_pwd_members' => \App\Models\PWDMember::whereHas('applications', function($query) use ($barangay) {
                    $query->where('barangay', $barangay)->where('status', 'Approved');
                })->count(),
                'pending_applications' => \App\Models\Application::where('barangay', $barangay)
                    ->whereIn('status', ['Pending Barangay Approval', 'Pending Admin Approval'])
                    ->count(),
                'new_this_month' => \App\Models\PWDMember::whereHas('applications', function($query) use ($barangay) {
                    $query->where('barangay', $barangay)
                          ->where('status', 'Approved')
                          ->whereMonth('created_at', now()->month)
                          ->whereYear('created_at', now()->year);
                })->count(),
                'unclaimed_cards' => \App\Models\PWDMember::whereHas('applications', function($query) use ($barangay) {
                    $query->where('barangay', $barangay)->where('status', 'Approved');
                })->whereNull('pwd_id')->count(),
            ];
            
            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getPWDMasterlist(Request $request, $barangay)
    {
        try {
            $members = \App\Models\PWDMember::with(['applications' => function($query) use ($barangay) {
                $query->where('barangay', $barangay)->where('status', 'Approved');
            }])->get()->filter(function($member) {
                return $member->applications->count() > 0;
            });

            $masterlist = $members->map(function($member) {
                $application = $member->applications->first();
                return [
                    'pwd_id' => $member->pwd_id,
                    'name' => $member->firstName . ' ' . $member->lastName,
                    'contact' => $member->contactNumber,
                    'address' => $member->address,
                    'disability_type' => $member->disabilityType,
                    'barangay' => $application->barangay,
                    'registration_date' => $application->created_at->format('Y-m-d'),
                ];
            });

            return response()->json(['members' => $masterlist]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getApplicationStatusReport(Request $request, $barangay)
    {
        try {
            $statuses = \App\Models\Application::where('barangay', $barangay)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get();

            return response()->json(['statuses' => $statuses]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getDisabilityDistribution(Request $request, $barangay)
    {
        try {
            $distribution = \App\Models\PWDMember::whereHas('applications', function($query) use ($barangay) {
                $query->where('barangay', $barangay)->where('status', 'Approved');
            })->selectRaw('disabilityType, COUNT(*) as count')
              ->groupBy('disabilityType')
              ->get();

            return response()->json(['distribution' => $distribution]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getAgeGroupAnalysis(Request $request, $barangay)
    {
        try {
            $members = \App\Models\PWDMember::whereHas('applications', function($query) use ($barangay) {
                $query->where('barangay', $barangay)->where('status', 'Approved');
            })->get();

            $ageGroups = [
                '0-17' => 0,
                '18-30' => 0,
                '31-50' => 0,
                '51-65' => 0,
                '65+' => 0
            ];

            foreach ($members as $member) {
                $age = now()->diffInYears($member->birthDate);
                if ($age <= 17) $ageGroups['0-17']++;
                elseif ($age <= 30) $ageGroups['18-30']++;
                elseif ($age <= 50) $ageGroups['31-50']++;
                elseif ($age <= 65) $ageGroups['51-65']++;
                else $ageGroups['65+']++;
            }

            return response()->json(['age_groups' => $ageGroups]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getBenefitDistribution(Request $request, $barangay)
    {
        try {
            $benefits = \App\Models\BenefitClaim::whereHas('pwdMember.applications', function($query) use ($barangay) {
                $query->where('barangay', $barangay)->where('status', 'Approved');
            })->with('benefit')->get();

            $distribution = $benefits->groupBy('benefit.name')->map(function($claims, $benefitName) {
                return [
                    'benefit_name' => $benefitName,
                    'total_claims' => $claims->count(),
                    'total_amount' => $claims->sum('amount'),
                ];
            });

            return response()->json(['distribution' => $distribution]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getMonthlyActivitySummary(Request $request, $barangay)
    {
        try {
            $currentMonth = now()->month;
            $currentYear = now()->year;

            $summary = [
                'applications_submitted' => \App\Models\Application::where('barangay', $barangay)
                    ->whereMonth('created_at', $currentMonth)
                    ->whereYear('created_at', $currentYear)
                    ->count(),
                'applications_approved' => \App\Models\Application::where('barangay', $barangay)
                    ->where('status', 'Approved')
                    ->whereMonth('updated_at', $currentMonth)
                    ->whereYear('updated_at', $currentYear)
                    ->count(),
                'new_registrations' => \App\Models\PWDMember::whereHas('applications', function($query) use ($barangay, $currentMonth, $currentYear) {
                    $query->where('barangay', $barangay)
                          ->where('status', 'Approved')
                          ->whereMonth('created_at', $currentMonth)
                          ->whereYear('created_at', $currentYear);
                })->count(),
            ];

            return response()->json(['summary' => $summary]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getCityWideStats(Request $request)
    {
        try {
            $stats = [
                'total_pwd_members' => \App\Models\PWDMember::whereHas('applications', function($query) {
                    $query->where('status', 'Approved');
                })->count(),
                'total_applications' => \App\Models\Application::count(),
                'pending_applications' => \App\Models\Application::whereIn('status', ['Pending Barangay Approval', 'Pending Admin Approval'])->count(),
                'total_barangays' => \App\Models\Application::distinct('barangay')->count('barangay'),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getAllBarangays(Request $request)
    {
        try {
            // Define all barangays in the system
            $allBarangays = [
                'Bigaa',
                'Butong', 
                'Marinig',
                'Gulod',
                'Pob. Uno',
                'Pob. Dos',
                'Pob. Tres',
                'Sala',
                'Niugan',
                'Banaybanay',
                'Pulo',
                'Diezmo',
                'Pittland',
                'San Isidro',
                'Mamatid',
                'Baclaran',
                'Casile',
                'Banlic'
            ];
            
            // Get barangays that have data (from applications, PWD members, etc.)
            $barangaysWithData = collect();
            
            // Get from applications
            $applicationBarangays = \App\Models\Application::select('barangay')
                ->distinct()
                ->whereNotNull('barangay')
                ->get()
                ->pluck('barangay')
                ->unique();
            
            // Get from PWD members
            $pwdMemberBarangays = \App\Models\PWDMember::select('barangay')
                ->distinct()
                ->whereNotNull('barangay')
                ->get()
                ->pluck('barangay')
                ->unique();
            
            // Get from barangay presidents
            $presidentBarangays = \App\Models\BarangayPresident::select('barangay')
                ->distinct()
                ->whereNotNull('barangay')
                ->get()
                ->pluck('barangay')
                ->unique();
            
            // Combine all barangays that have data
            $barangaysWithData = $applicationBarangays
                ->merge($pwdMemberBarangays)
                ->merge($presidentBarangays)
                ->unique()
                ->values();
            
            // Ensure all predefined barangays are included
            $allBarangays = collect($allBarangays)
                ->merge($barangaysWithData)
                ->unique()
                ->sort()
                ->values();
            
            return response()->json([
                'barangays' => $allBarangays,
                'total' => $allBarangays->count()
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getBarangayPerformance(Request $request)
    {
        try {
            // Define all barangays in the system
            $allBarangays = [
                'Bigaa',
                'Butong', 
                'Marinig',
                'Gulod',
                'Pob. Uno',
                'Pob. Dos',
                'Pob. Tres',
                'Sala',
                'Niugan',
                'Banaybanay',
                'Pulo',
                'Diezmo',
                'Pittland',
                'San Isidro',
                'Mamatid',
                'Baclaran',
                'Casile',
                'Banlic'
            ];
            
            // Get barangays that have data (from applications, PWD members, etc.)
            $barangaysWithData = collect();
            
            // Get from applications
            $applicationBarangays = \App\Models\Application::select('barangay')
                ->distinct()
                ->whereNotNull('barangay')
                ->get()
                ->pluck('barangay')
                ->unique();
            
            // Get from PWD members
            $pwdMemberBarangays = \App\Models\PWDMember::select('barangay')
                ->distinct()
                ->whereNotNull('barangay')
                ->get()
                ->pluck('barangay')
                ->unique();
            
            // Get from barangay presidents
            $presidentBarangays = \App\Models\BarangayPresident::select('barangay')
                ->distinct()
                ->whereNotNull('barangay')
                ->get()
                ->pluck('barangay')
                ->unique();
            
            // Combine all barangays that have data
            $barangaysWithData = $applicationBarangays
                ->merge($pwdMemberBarangays)
                ->merge($presidentBarangays)
                ->unique()
                ->values();
            
            // Ensure all predefined barangays are included
            $allBarangaysList = collect($allBarangays)
                ->merge($barangaysWithData)
                ->unique()
                ->sort()
                ->values();
            
            // Generate performance data for all barangays
            $barangays = $allBarangaysList->map(function($barangay) {
                return [
                    'barangay' => $barangay,
                    'registered' => \App\Models\PWDMember::whereHas('applications', function($query) use ($barangay) {
                        $query->where('barangay', $barangay)->where('status', 'Approved');
                    })->count(),
                    'cards' => \App\Models\PWDMember::whereHas('applications', function($query) use ($barangay) {
                        $query->where('barangay', $barangay)->where('status', 'Approved');
                    })->whereNotNull('pwd_id')->count(),
                    'benefits' => \App\Models\BenefitClaim::whereHas('pwdMember.applications', function($query) use ($barangay) {
                        $query->where('barangay', $barangay)->where('status', 'Approved');
                    })->count(),
                    'complaints' => \App\Models\Complaint::whereHas('pwdMember.applications', function($query) use ($barangay) {
                        $query->where('barangay', $barangay)->where('status', 'Approved');
                    })->count(),
                ];
            });

            return response()->json(['barangays' => $barangays]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function downloadReport(Request $request, $id)
    {
        try {
            $report = Report::find($id);
            if (!$report) {
                return response()->json(['message' => 'Report not found'], 404);
            }

            // For now, return a simple JSON response
            // In a real implementation, you would generate PDF/Excel files
            return response()->json([
                'message' => 'Report download initiated',
                'report_id' => $id,
                'format' => $request->get('format', 'pdf')
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}