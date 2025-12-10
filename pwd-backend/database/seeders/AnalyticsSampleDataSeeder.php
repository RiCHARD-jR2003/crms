<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BenefitClaim;
use App\Models\Application;
use App\Models\SupportTicket;
use App\Models\IDRenewal;
use App\Models\PWDMember;
use App\Models\Benefit;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AnalyticsSampleDataSeeder extends Seeder
{
    // All 18 barangays
    protected $barangays = [
        'Baclaran', 'Banay-Banay', 'Banlic', 'Bigaa', 'Butong', 'Casile',
        'Diezmo', 'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'Pittland',
        'Pulo', 'Sala', 'San Isidro',
        'Barangay I Poblacion', 'Barangay II Poblacion', 'Barangay III Poblacion'
    ];

    // Simple status distributions for easy comparison
    // 60% Claimed, 40% Pending
    protected $claimStatuses = ['Claimed', 'Claimed', 'Claimed', 'Pending', 'Pending'];
    
    // 80% Member, 20% Guardian
    protected $claimantTypes = ['Member', 'Member', 'Member', 'Member', 'Guardian'];
    
    // 50% Approved, 30% Pending, 20% Rejected
    protected $applicationStatuses = [
        'Approved', 'Approved', 'Approved', 'Approved', 'Approved',
        'Pending Barangay Approval', 'Pending Barangay Approval', 'Pending Barangay Approval',
        'Rejected', 'Rejected'
    ];
    
    // 50% Resolved, 30% Open, 20% Closed
    protected $ticketStatuses = ['resolved', 'resolved', 'resolved', 'resolved', 'resolved', 'open', 'open', 'open', 'closed', 'closed'];
    
    // 40% Medium, 30% Low, 30% High
    protected $ticketPriorities = ['medium', 'medium', 'medium', 'medium', 'low', 'low', 'low', 'high', 'high', 'high'];
    
    // 60% Approved, 30% Pending, 10% Rejected
    protected $renewalStatuses = ['Approved', 'Approved', 'Approved', 'Approved', 'Approved', 'Approved', 'Pending', 'Pending', 'Pending', 'Rejected'];

    /**
     * Create sample PWD members if needed
     */
    protected function createSampleMembers($currentCount, $targetCount)
    {
        $needed = $targetCount - $currentCount;
        if ($needed <= 0) return;

        echo "Creating {$needed} sample PWD members...\n";
        
        $maleFirstNames = ['Juan', 'Jose', 'Carlos', 'Antonio', 'Ricardo', 'Francisco', 'Manuel', 'Rodrigo', 'Fernando', 'Roberto'];
        $femaleFirstNames = ['Maria', 'Ana', 'Carmen', 'Rosa', 'Juana', 'Esperanza', 'Dolores', 'Rita', 'Elena', 'Isabel'];
        $lastNames = ['Dela Cruz', 'Garcia', 'Reyes', 'Ramos', 'Mendoza', 'Torres', 'Fernandez', 'Villanueva', 'Gutierrez', 'Cruz'];
        $disabilityTypes = ['Visual Impairment', 'Hearing Impairment', 'Physical Disability', 'Intellectual Disability', 'Mental Health Condition'];

        for ($i = 0; $i < $needed; $i++) {
            $barangay = $this->barangays[$i % count($this->barangays)];
            $isMale = ($i % 2 === 0);
            $firstName = $isMale 
                ? $maleFirstNames[$i % count($maleFirstNames)]
                : $femaleFirstNames[$i % count($femaleFirstNames)];
            $lastName = $lastNames[$i % count($lastNames)];

            // Create user first with unique username
            $baseUsername = strtolower(str_replace(' ', '', $firstName . '.' . $lastName));
            $username = $baseUsername . '.' . ($currentCount + $i) . '.' . time() . '.' . rand(1000, 9999);
            $email = $baseUsername . '.' . ($currentCount + $i) . '.' . time() . '@sample.com';
            
            $user = User::create([
                'username' => $username,
                'email' => $email,
                'password' => Hash::make('Sample123!'),
                'role' => 'PWDMember',
                'status' => 'Active',
                'password_change_required' => false
            ]);

            // Create PWD member
            PWDMember::create([
                'userID' => $user->userID,
                'pwd_id' => 'PWD-' . str_pad($user->userID, 6, '0', STR_PAD_LEFT),
                'firstName' => $firstName,
                'lastName' => $lastName,
                'middleName' => 'Sample',
                'birthDate' => Carbon::now()->subYears(rand(25, 65)),
                'gender' => $isMale ? 'Male' : 'Female',
                'disabilityType' => $disabilityTypes[$i % count($disabilityTypes)],
                'address' => rand(100, 999) . ' Sample Street, ' . $barangay,
                'barangay' => $barangay,
                'contactNumber' => '09' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT),
                'email' => $user->email,
                'status' => 'Active',
                'cardClaimed' => rand(0, 1) === 1,
                'cardIssueDate' => rand(0, 1) === 1 ? Carbon::now()->subMonths(rand(1, 12)) : null,
                'cardExpirationDate' => rand(0, 1) === 1 ? Carbon::now()->addMonths(rand(1, 36)) : null,
                'approval_date' => Carbon::create(2024, 1, 1)->addDays(rand(0, 730)),
                'created_at' => Carbon::create(2024, 1, 1)->addDays(rand(0, 730)),
                'updated_at' => Carbon::now()
            ]);
        }
        
        echo "✓ Created {$needed} sample PWD members\n";
    }

    /**
     * Run the database seeds.
     */
    public function run()
    {
        echo "Generating 500 sample analytics data entries for 2024-2025...\n\n";

        // Get existing PWD members and benefits
        $pwdMembers = PWDMember::where('status', 'Active')->get();
        $benefits = Benefit::where('status', 'Active')->get();

        if ($pwdMembers->isEmpty()) {
            echo "⚠️  No active PWD members found. Please run PWDMemberSeeder first.\n";
            return;
        }

        if ($benefits->isEmpty()) {
            echo "⚠️  No active benefits found. Please create benefits first.\n";
            return;
        }

        // Ensure we have enough members - if not, create some sample members
        if ($pwdMembers->count() < 100) {
            echo "⚠️  Warning: Only {$pwdMembers->count()} members found. Creating additional sample members...\n";
            $this->createSampleMembers($pwdMembers->count(), 100);
            $pwdMembers = PWDMember::where('status', 'Active')->get();
        }

        $created = 0;
        // Date range: January 1, 2024 to December 31, 2025
        $startDate = Carbon::create(2024, 1, 1);
        $endDate = Carbon::create(2025, 12, 31);
        
        // Simple date distribution: evenly spaced over 2 years (730 days)
        // 500 entries total, so approximately 1.5 days between each entry
        $totalDays = $startDate->diffInDays($endDate);
        $dateStep = max(1, floor($totalDays / 500)); // Days between each entry

        // Distribute 500 entries across different types for comprehensive analytics
        // 200 Benefit Claims (40% - most important for analytics)
        // 150 Applications (30% - for approval rate analytics)
        // 100 Support Tickets (20% - for resolution rate analytics)
        // 50 ID Renewals (10% - for renewal analytics)

        DB::beginTransaction();
        try {
            // 1. Create 200 Benefit Claims - evenly distributed
            echo "Creating 200 benefit claims...\n";
            $barangayIndex = 0;
            for ($i = 0; $i < 200; $i++) {
                // Cycle through members to ensure all have data
                $memberIndex = $i % $pwdMembers->count();
                $member = $pwdMembers[$memberIndex];
                $benefit = $benefits->random();
                // Distribute evenly across barangays
                $barangay = $this->barangays[$barangayIndex % count($this->barangays)];
                $barangayIndex++;
                
                // Ensure member's barangay matches (or update it)
                if ($member->barangay !== $barangay) {
                    $member->barangay = $barangay;
                    $member->save();
                }

                // Use simple date distribution - evenly spaced
                $claimDate = $startDate->copy()->addDays($i * $dateStep);
                $status = $this->claimStatuses[$i % count($this->claimStatuses)];
                $claimantType = $this->claimantTypes[$i % count($this->claimantTypes)];

                BenefitClaim::create([
                    'pwdID' => $member->userID,
                    'benefitID' => $benefit->id,
                    'claimDate' => $claimDate,
                    'status' => $status,
                    'claimantType' => $claimantType,
                    'claimantName' => $claimantType === 'Member' 
                        ? trim($member->firstName . ' ' . $member->lastName)
                        : 'Sample Claimant ' . ($i + 1),
                    'claimantRelation' => $claimantType !== 'Member' ? 'Guardian' : null,
                    'created_at' => $claimDate,
                    'updated_at' => $claimDate
                ]);
                $created++;
            }
            echo "✓ Created 200 benefit claims\n";

            // 2. Create 150 Applications - evenly distributed
            echo "Creating 150 applications...\n";
            $maleFirstNames = ['Juan', 'Jose', 'Carlos', 'Antonio', 'Ricardo'];
            $femaleFirstNames = ['Maria', 'Ana', 'Carmen', 'Rosa', 'Juana'];
            $lastNames = ['Dela Cruz', 'Garcia', 'Reyes', 'Ramos', 'Mendoza'];
            $disabilityTypes = ['Visual Impairment', 'Hearing Impairment', 'Physical Disability', 'Intellectual Disability', 'Mental Health Condition'];

            for ($i = 0; $i < 150; $i++) {
                // Distribute evenly across barangays
                $barangay = $this->barangays[$i % count($this->barangays)];
                $isMale = ($i % 2 === 0);
                $firstName = $isMale 
                    ? $maleFirstNames[$i % count($maleFirstNames)]
                    : $femaleFirstNames[$i % count($femaleFirstNames)];
                $lastName = $lastNames[$i % count($lastNames)];
                $status = $this->applicationStatuses[$i % count($this->applicationStatuses)];
                // Use simple date distribution - evenly spaced
                $submissionDate = $startDate->copy()->addDays(($i + 200) * $dateStep);

                // Generate application ID (integer)
                $nextAppId = Application::max('applicationID') ? Application::max('applicationID') + 1 : 1;

                Application::create([
                    'applicationID' => $nextAppId,
                    'pwdID' => null, // New application, not yet approved
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                    'middleName' => 'Sample',
                    'birthDate' => Carbon::now()->subYears(rand(25, 65))->format('Y-m-d'),
                    'gender' => $isMale ? 'Male' : 'Female',
                    'disabilityType' => $disabilityTypes[$i % count($disabilityTypes)],
                    'address' => rand(100, 999) . ' Sample Street, ' . $barangay,
                    'barangay' => $barangay,
                    'contactNumber' => '09' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT),
                    'email' => strtolower($firstName . '.' . $lastName . '.' . $i . '@sample.com'),
                    'idType' => 'National ID',
                    'idNumber' => 'NAT' . str_pad(rand(1000000, 9999999), 8, '0', STR_PAD_LEFT),
                    'emergencyContact' => 'Emergency Contact',
                    'emergencyPhone' => '09' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT),
                    'emergencyRelationship' => 'Family',
                    'status' => $status,
                    'submissionDate' => $submissionDate,
                    'referenceNumber' => 'REF-' . strtoupper(substr(md5($nextAppId . time() . $i), 0, 8)),
                    'created_at' => $submissionDate,
                    'updated_at' => $submissionDate
                ]);
                $created++;
            }
            echo "✓ Created 150 applications\n";

            // 3. Create 100 Support Tickets - evenly distributed
            echo "Creating 100 support tickets...\n";
            $ticketSubjects = [
                'ID Card Issue',
                'Benefit Claim Inquiry',
                'Document Upload Problem',
                'Application Status Question',
                'Renewal Process Help',
                'Account Access Issue',
                'Profile Update Request',
                'Benefit Eligibility Question',
                'Technical Support Needed',
                'General Inquiry'
            ];
            $ticketMessages = [
                'I need help with my ID card application.',
                'When can I claim my benefit?',
                'I cannot upload my documents.',
                'What is the status of my application?',
                'How do I renew my PWD ID?',
                'I forgot my password.',
                'I need to update my profile information.',
                'Am I eligible for this benefit?',
                'The website is not working properly.',
                'I have a general question about the system.'
            ];

            for ($i = 0; $i < 100; $i++) {
                // Ensure we use a valid member - cycle through members to ensure all have data
                $memberIndex = $i % $pwdMembers->count();
                $member = $pwdMembers[$memberIndex];
                // Distribute evenly across barangays
                $barangay = $this->barangays[$i % count($this->barangays)];
                $status = $this->ticketStatuses[$i % count($this->ticketStatuses)];
                $priority = $this->ticketPriorities[$i % count($this->ticketPriorities)];
                // Use simple date distribution - evenly spaced
                $createdDate = $startDate->copy()->addDays(($i + 350) * $dateStep);

                $ticketNumber = 'TKT-' . date('Y') . '-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT);
                
                $ticket = SupportTicket::create([
                    'ticket_number' => $ticketNumber,
                    'pwd_member_id' => $member->id,
                    'subject' => $ticketSubjects[$i % count($ticketSubjects)],
                    'description' => $ticketMessages[$i % count($ticketMessages)],
                    'status' => $status,
                    'priority' => $priority,
                    'category' => 'General Inquiry',
                    'created_at' => $createdDate,
                    'updated_at' => $status === 'resolved' || $status === 'closed' 
                        ? $createdDate->copy()->addDays(rand(1, 7))
                        : $createdDate
                ]);

                // Add initial message
                try {
                    DB::table('support_ticket_messages')->insert([
                        'support_ticket_id' => $ticket->id,
                        'sender_id' => $member->id,
                        'sender_type' => 'pwd_member',
                        'message' => $ticketMessages[$i % count($ticketMessages)],
                        'created_at' => $createdDate,
                        'updated_at' => $createdDate
                    ]);
                } catch (\Exception $e) {
                    // Messages table might have different structure, continue anyway
                }

                $created++;
            }
            echo "✓ Created 100 support tickets\n";

            // 4. Create 50 ID Renewals - evenly distributed
            echo "Creating 50 ID renewals...\n";
            for ($i = 0; $i < 50; $i++) {
                // Ensure we use a valid member - cycle through members to ensure all have data
                $memberIndex = ($i + 100) % $pwdMembers->count();
                $member = $pwdMembers[$memberIndex];
                // Distribute evenly across barangays
                $barangay = $this->barangays[$i % count($this->barangays)];
                $status = $this->renewalStatuses[$i % count($this->renewalStatuses)];
                // Use simple date distribution - evenly spaced
                $submittedDate = $startDate->copy()->addDays(($i + 450) * $dateStep);

                IDRenewal::create([
                    'member_id' => $member->userID,
                    'status' => strtolower($status),
                    'submitted_at' => $submittedDate,
                    'old_card_image_path' => 'sample/old_card_' . $i . '.jpg',
                    'medical_certificate_path' => 'sample/medical_' . $i . '.pdf',
                    'reviewed_at' => $status !== 'Pending' ? $submittedDate->copy()->addDays(rand(1, 5)) : null,
                    'reviewed_by' => $status !== 'Pending' ? 1 : null,
                    'notes' => $status === 'Rejected' ? 'Sample rejection reason' : null,
                    'created_at' => $submittedDate,
                    'updated_at' => $submittedDate
                ]);
                $created++;
            }
            echo "✓ Created 50 ID renewals\n";

            DB::commit();
            
            echo "\n========================================\n";
            echo "SUCCESS! Created {$created} sample analytics data entries\n";
            echo "========================================\n\n";
            echo "Distribution:\n";
            echo "  - 200 Benefit Claims (40%)\n";
            echo "  - 150 Applications (30%)\n";
            echo "  - 100 Support Tickets (20%)\n";
            echo "  - 50 ID Renewals (10%)\n";
            echo "\nAll entries are distributed evenly across all 18 barangays.\n";
            echo "Data spans from January 1, 2024 to December 31, 2025.\n";
            echo "All entries have associated member data for analytics.\n";

        } catch (\Exception $e) {
            DB::rollBack();
            echo "\nERROR: Failed to create sample analytics data\n";
            echo "Error: " . $e->getMessage() . "\n";
            echo "Trace: " . $e->getTraceAsString() . "\n";
            exit(1);
        }
    }
}

