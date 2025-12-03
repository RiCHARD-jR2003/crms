<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PWDMember;
use App\Models\Application;
use App\Models\Announcement;
use App\Models\Benefit;
use App\Models\BenefitClaim;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\DisabilityAssessment;
use App\Models\IDClaim;
use App\Models\MemberDocument;
use App\Models\RequiredDocument;
use App\Models\Notification;
use App\Models\Complaint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ComprehensiveTestDataSeeder extends Seeder
{
    // All 18 barangays
    protected $barangays = [
        'Baclaran', 'Banay-Banay', 'Banlic', 'Bigaa', 'Butong', 'Casile',
        'Diezmo', 'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'Pittland',
        'Pulo', 'Sala', 'San Isidro',
        'Barangay I Poblacion', 'Barangay II Poblacion', 'Barangay III Poblacion'
    ];

    // Disability types
    protected $disabilityTypes = [
        'Visual Impairment', 'Hearing Impairment', 'Speech and Language Impairment',
        'Intellectual Disability', 'Mental Health Condition', 'Learning Disability',
        'Psychosocial Disability', 'Autism Spectrum Disorder', 'ADHD',
        'Physical Disability', 'Orthopedic/Physical Disability', 'Chronic Illness',
        'Multiple Disabilities'
    ];

    // Disability causes
    protected $disabilityCauses = [
        'Congenital/Inborn', 'Illness', 'Accident', 'Other'
    ];

    // Application statuses to cover all scenarios
    protected $applicationStatuses = [
        'Pending' => 15,
        'Pending Barangay Approval' => 20,
        'For Assessment' => 15,
        'Pending Admin Approval' => 10,
        'Approved' => 80,
        'Rejected' => 10,
        'Under Review' => 5,
        'Needs Additional Documents' => 5,
        'Expired' => 5,
        'For Claiming' => 10,
        'For Renewal' => 5
    ];

    // Name lists
    protected $maleFirstNames = [
        'Juan', 'Jose', 'Carlos', 'Antonio', 'Ricardo', 'Francisco', 'Manuel', 'Rodrigo',
        'Fernando', 'Roberto', 'Miguel', 'Eduardo', 'Alberto', 'Armando', 'Ramon',
        'Julio', 'Rafael', 'Daniel', 'Luis', 'Mario', 'Angel', 'Pablo', 'Victor',
        'Gabriel', 'Sebastian', 'Enrique', 'Pedro', 'Andres', 'Felipe', 'Hector'
    ];

    protected $femaleFirstNames = [
        'Maria', 'Ana', 'Carmen', 'Rosa', 'Juana', 'Esperanza', 'Dolores', 'Rita',
        'Elena', 'Isabel', 'Teresa', 'Lucia', 'Patricia', 'Martha', 'Cecilia',
        'Angela', 'Rebecca', 'Monica', 'Sofia', 'Andrea', 'Laura', 'Gloria', 'Norma'
    ];

    protected $lastNames = [
        'Dela Cruz', 'Garcia', 'Reyes', 'Ramos', 'Mendoza', 'Torres', 'Fernandez',
        'Villanueva', 'Gutierrez', 'Cruz', 'Lopez', 'Bautista', 'Santos', 'Morales',
        'Aquino', 'Rivera', 'Ocampo', 'Castro', 'Martinez', 'Gonzalez', 'Diaz',
        'Salazar', 'Espinoza', 'Alvarez', 'Perez', 'Gomez', 'Medina', 'Herrera'
    ];

    protected $middleNames = [
        'Santos', 'Cruz', 'Reyes', 'Garcia', 'Lopez', 'Torres', 'Fernandez',
        'Mendoza', 'Ramos', 'Gonzalez', 'Diaz', 'Morales', 'Villanueva', 'Bautista'
    ];

    protected $suffixes = ['', '', '', '', '', '', 'Jr.', 'Sr.', 'II', 'III'];

    protected $emergencyRelationships = [
        'Mother', 'Father', 'Husband', 'Wife', 'Sister', 'Brother',
        'Son', 'Daughter', 'Cousin', 'Friend', 'Guardian'
    ];

    protected $streetNames = [
        'Main Street', 'Rizal Street', 'Bonifacio Street', 'Mabini Street',
        'Aguinaldo Street', 'Luna Street', 'Quezon Avenue', 'Santos Avenue',
        'Garcia Street', 'Reyes Street', 'Cruz Street', 'Torres Street'
    ];

    // Counters for tracking
    protected $userIdCounter = 100;
    protected $applicationCounter = 1;
    protected $createdApplications = [];
    protected $createdMembers = [];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting Comprehensive Test Data Seeder...');
        $this->command->info('This will create 180 test accounts across all statuses and features.');
        $this->command->newLine();

        DB::beginTransaction();

        try {
            // 1. Create Applications with all statuses
            $this->createApplications();

            // 2. Create PWD Members from approved applications
            $this->createPWDMembers();

            // 3. Create Test Benefits and Ayuda
            $this->createBenefits();

            // 4. Create Benefit Claims
            $this->createBenefitClaims();

            // 5. Create Support Tickets
            $this->createSupportTickets();

            // 6. Create Disability Assessments
            $this->createDisabilityAssessments();

            // 7. Create ID Claims
            $this->createIDClaims();

            // 8. Create Member Documents
            $this->createMemberDocuments();

            // 9. Create Notifications
            $this->createNotifications();

            // 10. Create Complaints
            $this->createComplaints();

            // 11. Create Test Announcements
            $this->createAnnouncements();

            DB::commit();

            $this->command->newLine();
            $this->command->info('✅ Test data creation completed successfully!');
            $this->printSummary();

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('❌ Error creating test data: ' . $e->getMessage());
            Log::error('ComprehensiveTestDataSeeder failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Create applications with all possible statuses
     */
    protected function createApplications(): void
    {
        $this->command->info('📝 Creating applications with all statuses...');
        $progressBar = $this->command->getOutput()->createProgressBar(array_sum($this->applicationStatuses));
        $progressBar->start();

        foreach ($this->applicationStatuses as $status => $count) {
            for ($i = 0; $i < $count; $i++) {
                $application = $this->createSingleApplication($status);
                if ($application) {
                    $this->createdApplications[$status][] = $application;
                }
                $progressBar->advance();
            }
        }

        $progressBar->finish();
        $this->command->newLine();
    }

    /**
     * Create a single application
     */
    protected function createSingleApplication(string $status): ?Application
    {
        try {
            $gender = rand(0, 1) === 0 ? 'Male' : 'Female';
            $firstName = $gender === 'Male'
                ? $this->maleFirstNames[array_rand($this->maleFirstNames)]
                : $this->femaleFirstNames[array_rand($this->femaleFirstNames)];
            $lastName = $this->lastNames[array_rand($this->lastNames)];
            $middleName = $this->middleNames[array_rand($this->middleNames)];
            $suffix = $this->suffixes[array_rand($this->suffixes)];
            $barangay = $this->barangays[array_rand($this->barangays)];
            $disabilityType = $this->disabilityTypes[array_rand($this->disabilityTypes)];
            $disabilityCause = $this->disabilityCauses[array_rand($this->disabilityCauses)];

            // Generate birth date (age 18-80)
            $birthYear = date('Y') - rand(18, 80);
            $birthDate = Carbon::create($birthYear, rand(1, 12), rand(1, 28))->format('Y-m-d');

            // Generate unique identifier for this application
            $uniqueId = uniqid() . $this->applicationCounter;

            // Generate unique email using timestamp to prevent duplicates
            $email = strtolower(str_replace([' ', '-', "'"], '', 
                $firstName . $lastName . $uniqueId . '@testpwd.com'
            ));

            // Generate reference number with unique ID
            $referenceNumber = 'TEST-' . date('Y') . '-' . str_pad($this->applicationCounter, 6, '0', STR_PAD_LEFT);

            // Contact info
            $contactNumber = '09' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT);
            $emergencyPhone = '09' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT);
            $emergencyContact = $this->maleFirstNames[array_rand($this->maleFirstNames)] . ' ' . 
                               $this->lastNames[array_rand($this->lastNames)];
            $emergencyRelationship = $this->emergencyRelationships[array_rand($this->emergencyRelationships)];

            // Address
            $streetNumber = rand(1, 999);
            $street = $this->streetNames[array_rand($this->streetNames)];
            $address = "{$streetNumber} {$street}";

            // Submission date based on status
            $submissionDate = $this->getSubmissionDateForStatus($status);

            // Assessment status based on application status
            // Valid values: 'not_required', 'pending', 'scheduled', 'in_progress', 'completed', 'finalized', 'uploaded'
            $assessmentStatus = 'not_required';
            if ($status === 'For Assessment') {
                $assessmentStatus = ['pending', 'scheduled', 'in_progress', 'completed'][rand(0, 3)];
            } elseif ($status === 'Approved' || $status === 'For Claiming') {
                $assessmentStatus = 'finalized';
            }

            $applicationData = [
                'referenceNumber' => $referenceNumber,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'middleName' => $middleName,
                'suffix' => $suffix,
                'birthDate' => $birthDate,
                'gender' => $gender,
                'civilStatus' => ['Single', 'Married', 'Widowed', 'Separated'][rand(0, 3)],
                'nationality' => 'Filipino',
                'disabilityType' => $disabilityType,
                'disabilityCause' => $disabilityCause,
                'disabilityDate' => Carbon::parse($birthDate)->addYears(rand(0, 10))->format('Y-m-d'),
                'address' => $address,
                'barangay' => $barangay,
                'city' => 'Cabuyao',
                'province' => 'Laguna',
                'postalCode' => '4025',
                'email' => $email,
                'contactNumber' => $contactNumber,
                'emergencyContact' => $emergencyContact,
                'emergencyPhone' => $emergencyPhone,
                'emergencyRelationship' => $emergencyRelationship,
                'idType' => ['PhilSys ID', 'Voter ID', 'Driver License', 'Passport'][rand(0, 3)],
                'idNumber' => strtoupper(substr(md5($uniqueId), 0, 12)),
                'medicalCertificate' => 'applications/test/medical_cert_' . $this->applicationCounter . '.pdf',
                'clinicalAbstract' => rand(0, 1) ? 'applications/test/clinical_' . $this->applicationCounter . '.pdf' : null,
                'idPictures' => 'applications/test/id_pic_' . $this->applicationCounter . '.jpg',
                'submissionDate' => $submissionDate,
                'status' => $status,
                'remarks' => $this->getRemarksForStatus($status),
                'assessment_status' => $assessmentStatus,
            ];

            $application = Application::create($applicationData);

            $this->applicationCounter++;
            return $application;

        } catch (\Exception $e) {
            $this->command->warn("   Failed to create application ({$status}): " . $e->getMessage());
            Log::error('Failed to create application', [
                'status' => $status,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            $this->applicationCounter++; // Still increment to avoid duplicate keys
            return null;
        }
    }

    /**
     * Create PWD Members from approved applications
     */
    protected function createPWDMembers(): void
    {
        $this->command->info('👥 Creating PWD Members from approved applications...');
        
        $approvedApplications = $this->createdApplications['Approved'] ?? [];
        $forClaimingApplications = $this->createdApplications['For Claiming'] ?? [];
        $forRenewalApplications = $this->createdApplications['For Renewal'] ?? [];
        
        $allApproved = array_merge($approvedApplications, $forClaimingApplications, $forRenewalApplications);
        
        if (empty($allApproved)) {
            $this->command->warn('No approved applications found to create members.');
            return;
        }

        $progressBar = $this->command->getOutput()->createProgressBar(count($allApproved));
        $progressBar->start();

        foreach ($allApproved as $application) {
            $member = $this->createMemberFromApplication($application);
            if ($member) {
                $this->createdMembers[] = $member;
            }
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->command->newLine();
    }

    /**
     * Create a PWD Member from an approved application
     */
    protected function createMemberFromApplication(Application $application): ?PWDMember
    {
        try {
            // Create user account
            $username = strtolower(str_replace([' ', '-', "'"], '', 
                $application->firstName . $application->middleName . $application->lastName . $this->userIdCounter
            ));

            $user = User::create([
                'username' => $username,
                'email' => $application->email,
                'password' => Hash::make('Test@123'),
                'role' => 'PWDMember',
                'status' => 'Active',
                'password_change_required' => false
            ]);

            // Update application with pwdID
            $application->update(['pwdID' => $user->userID]);

            // Generate PWD ID
            $pwdId = 'PWD-' . str_pad($user->userID, 6, '0', STR_PAD_LEFT);

            // Determine card claim status
            $cardClaimed = in_array($application->status, ['Approved', 'For Renewal']);
            $cardIssueDate = $cardClaimed ? Carbon::now()->subMonths(rand(1, 24)) : null;
            $cardExpirationDate = $cardIssueDate ? $cardIssueDate->copy()->addYears(3) : null;

            // Member status variations
            $memberStatuses = ['Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Inactive'];
            $memberStatus = $cardClaimed ? $memberStatuses[array_rand($memberStatuses)] : 'Pending';

            $member = PWDMember::create([
                'userID' => $user->userID,
                'pwd_id' => $pwdId,
                'pwd_id_generated_at' => now()->subDays(rand(1, 30)),
                'firstName' => $application->firstName,
                'lastName' => $application->lastName,
                'middleName' => $application->middleName,
                'suffix' => $application->suffix,
                'birthDate' => $application->birthDate,
                'gender' => $application->gender,
                'disabilityType' => $application->disabilityType,
                'address' => $application->address . ', ' . $application->barangay . ', ' . $application->city,
                'contactNumber' => $application->contactNumber,
                'email' => $application->email,
                'barangay' => $application->barangay,
                'emergencyContact' => $application->emergencyContact,
                'emergencyPhone' => $application->emergencyPhone,
                'emergencyRelationship' => $application->emergencyRelationship,
                'status' => $memberStatus,
                'cardClaimed' => $cardClaimed,
                'cardIssueDate' => $cardIssueDate,
                'cardExpirationDate' => $cardExpirationDate,
            ]);

            $this->userIdCounter++;
            return $member;

        } catch (\Exception $e) {
            Log::warning('Failed to create member', [
                'application_id' => $application->applicationID,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Create test benefits
     */
    protected function createBenefits(): void
    {
        $this->command->info('🎁 Creating test benefits and ayuda programs...');

        $benefitTypes = [
            [
                'type' => 'Financial Assistance',
                'title' => 'Monthly Financial Assistance - Q1 2025',
                'amount' => '₱5,000',
                'description' => 'Monthly financial assistance for PWD members',
                'status' => 'Active'
            ],
            [
                'type' => 'Birthday Cash Gift',
                'title' => 'Q1 Birthday Cash Gift 2025',
                'amount' => '₱2,000',
                'description' => 'Birthday cash gift for PWD members born in Q1',
                'birthdayMonth' => 'Q1',
                'status' => 'Active'
            ],
            [
                'type' => 'Birthday Cash Gift',
                'title' => 'Q2 Birthday Cash Gift 2025',
                'amount' => '₱2,000',
                'description' => 'Birthday cash gift for PWD members born in Q2',
                'birthdayMonth' => 'Q2',
                'status' => 'Active'
            ],
            [
                'type' => 'Financial Assistance',
                'title' => 'Emergency Relief Fund',
                'amount' => '₱3,000',
                'description' => 'Emergency relief fund for PWD members',
                'status' => 'Active'
            ],
            [
                'type' => 'Financial Assistance',
                'title' => 'Scholarship Assistance',
                'amount' => '₱10,000',
                'description' => 'Educational assistance for PWD students',
                'status' => 'Pending'
            ]
        ];

        foreach ($benefitTypes as $benefitData) {
            // Randomly select 5-10 barangays for each benefit
            $selectedBarangays = array_slice(
                $this->barangays,
                0,
                rand(5, count($this->barangays))
            );
            shuffle($selectedBarangays);
            $selectedBarangays = array_slice($selectedBarangays, 0, rand(5, 10));

            try {
                Benefit::create([
                    'title' => $benefitData['title'],
                    'type' => $benefitData['type'],
                    'amount' => $benefitData['amount'],
                    'description' => $benefitData['description'],
                    'status' => $benefitData['status'],
                    'selectedBarangays' => $selectedBarangays,
                    'barangay' => 'All',
                    'birthdayMonth' => $benefitData['birthdayMonth'] ?? null,
                    'distributionDate' => Carbon::now()->addDays(rand(7, 30)),
                    'expiryDate' => Carbon::now()->addMonths(rand(1, 3)),
                    'targetRecipients' => rand(50, 200),
                    'distributed' => rand(0, 50),
                    'pending' => rand(10, 100),
                    'color' => ['#3498DB', '#27AE60', '#E67E22', '#9B59B6', '#E74C3C'][rand(0, 4)],
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed to create benefit', ['error' => $e->getMessage()]);
            }
        }

        $this->command->info('   Created ' . count($benefitTypes) . ' benefits');
    }

    /**
     * Create benefit claims
     */
    protected function createBenefitClaims(): void
    {
        $this->command->info('📋 Creating benefit claims...');

        $benefits = Benefit::where('status', 'Active')->get();
        $claimStatuses = ['Unclaimed', 'Unclaimed', 'Unclaimed', 'Claimed', 'Claimed', 'Processing'];
        $claimCount = 0;

        foreach ($this->createdMembers as $member) {
            // Each member might have 0-2 benefit claims
            $numClaims = rand(0, 2);
            
            for ($i = 0; $i < $numClaims && $benefits->isNotEmpty(); $i++) {
                $benefit = $benefits->random();
                $status = $claimStatuses[array_rand($claimStatuses)];

                try {
                    BenefitClaim::create([
                        'pwdID' => $member->userID,
                        'benefitID' => $benefit->id,
                        'claimDate' => $status === 'Claimed' ? Carbon::now()->subDays(rand(1, 30)) : null,
                        'status' => $status,
                    ]);
                    $claimCount++;
                } catch (\Exception $e) {
                    // Skip duplicates
                }
            }
        }

        $this->command->info("   Created {$claimCount} benefit claims");
    }

    /**
     * Create support tickets
     */
    protected function createSupportTickets(): void
    {
        $this->command->info('🎫 Creating support tickets...');

        $ticketCategories = [
            'Application Issue', 'ID Card Problem', 'Benefits Inquiry',
            'Account Access', 'Document Upload', 'General Inquiry', 'Technical Support'
        ];

        $ticketPriorities = ['low', 'medium', 'high', 'urgent'];
        $ticketStatuses = ['open', 'in_progress', 'waiting_for_reply', 'resolved', 'closed'];

        $sampleSubjects = [
            'Cannot upload documents',
            'Application status not updating',
            'Benefits claim not processed',
            'Cannot login to account',
            'ID card renewal inquiry',
            'Need assistance with application',
            'Document rejected - need help',
            'When will I receive my benefits?'
        ];

        $ticketCount = 0;

        // Get members from database if not enough in memory
        $members = !empty($this->createdMembers) ? $this->createdMembers : PWDMember::limit(100)->get();

        foreach ($members as $index => $member) {
            // 60% of members have tickets (increased from 40%)
            if (rand(1, 100) > 60) continue;

            $numTickets = rand(1, 2);
            
            for ($i = 0; $i < $numTickets; $i++) {
                try {
                    $status = $ticketStatuses[array_rand($ticketStatuses)];
                    $ticketNumber = 'TKT-' . date('Y') . '-' . str_pad($ticketCount + 1, 6, '0', STR_PAD_LEFT);

                    $ticket = SupportTicket::create([
                        'ticket_number' => $ticketNumber,
                        'user_id' => $member->userID,
                        'subject' => $sampleSubjects[array_rand($sampleSubjects)],
                        'category' => $ticketCategories[array_rand($ticketCategories)],
                        'priority' => $ticketPriorities[array_rand($ticketPriorities)],
                        'status' => $status,
                        'created_at' => Carbon::now()->subDays(rand(1, 60)),
                    ]);

                    // Add initial message
                    SupportTicketMessage::create([
                        'ticket_id' => $ticket->id,
                        'user_id' => $member->userID,
                        'message' => 'This is a test support ticket message. I need help with my issue.',
                        'is_staff' => false,
                    ]);

                    // Add staff reply for some tickets
                    if (in_array($status, ['in_progress', 'waiting_for_reply', 'resolved', 'closed'])) {
                        SupportTicketMessage::create([
                            'ticket_id' => $ticket->id,
                            'user_id' => 1, // Admin user
                            'message' => 'Thank you for contacting us. We are looking into your issue.',
                            'is_staff' => true,
                        ]);
                    }

                    $ticketCount++;
                } catch (\Exception $e) {
                    // Log but continue
                }
            }
        }

        $this->command->info("   Created {$ticketCount} support tickets");
    }

    /**
     * Create disability assessments
     */
    protected function createDisabilityAssessments(): void
    {
        $this->command->info('📋 Creating disability assessments...');

        // Get applications with 'For Assessment' status from database
        $forAssessmentApps = Application::where('status', 'For Assessment')
            ->whereDoesntHave('disabilityAssessment')
            ->get();
        
        $assessmentCount = 0;

        foreach ($forAssessmentApps as $application) {
            $statuses = [
                DisabilityAssessment::STATUS_PENDING,
                DisabilityAssessment::STATUS_SCHEDULED,
                DisabilityAssessment::STATUS_COMPLETED,
                DisabilityAssessment::STATUS_FINALIZED
            ];
            $status = $statuses[array_rand($statuses)];

            try {
                $referenceNumber = 'DA-' . date('Y') . '-' . str_pad($assessmentCount + 1, 5, '0', STR_PAD_LEFT);
                
                $assessmentDate = $status !== DisabilityAssessment::STATUS_PENDING 
                    ? Carbon::now()->addDays(rand(1, 14)) 
                    : null;
                
                $slotNumber = $assessmentDate ? rand(1, 10) : null;

                DisabilityAssessment::create([
                    'application_id' => $application->applicationID,
                    'reference_number' => $referenceNumber,
                    'status' => $status,
                    'assessment_date' => $assessmentDate,
                    'slot_number' => $slotNumber,
                    'applicant_name' => $application->firstName . ' ' . $application->lastName,
                    'applicant_email' => $application->email,
                    'applicant_contact' => $application->contactNumber,
                    'disability_type' => $application->disabilityType,
                    'disability_cause' => $application->disabilityCause,
                    'disability_description' => 'Test disability description for assessment.',
                    'disability_severity' => ['mild', 'moderate', 'severe', 'profound'][rand(0, 3)],
                    'assessed_by' => in_array($status, [DisabilityAssessment::STATUS_COMPLETED, DisabilityAssessment::STATUS_FINALIZED]) ? 1 : null,
                    'assessed_at' => in_array($status, [DisabilityAssessment::STATUS_COMPLETED, DisabilityAssessment::STATUS_FINALIZED]) ? now() : null,
                ]);

                $assessmentCount++;
            } catch (\Exception $e) {
                // Log but continue
            }
        }

        $this->command->info("   Created {$assessmentCount} disability assessments");
    }

    /**
     * Create ID claims
     */
    protected function createIDClaims(): void
    {
        $this->command->info('🪪 Creating ID claims...');

        $claimStatuses = [
            IDClaim::STATUS_PENDING,
            IDClaim::STATUS_PROCESSING,
            IDClaim::STATUS_READY_FOR_PICKUP,
            IDClaim::STATUS_SCHEDULED,
            IDClaim::STATUS_CLAIMED
        ];

        $claimCount = 0;

        // Get members from database (those who may need ID claims)
        $members = PWDMember::where('cardClaimed', false)->limit(50)->get();
        
        // If no unclaimed cards, get some random members for renewals
        if ($members->isEmpty()) {
            $members = PWDMember::limit(30)->get();
        }

        foreach ($members as $member) {
            // 70% have claims
            if (rand(1, 100) > 70) continue;

            $status = $claimStatuses[array_rand($claimStatuses)];

            try {
                $claimNumber = 'IDC-' . date('Y') . '-' . str_pad($claimCount + 1, 5, '0', STR_PAD_LEFT);

                IDClaim::create([
                    'claim_number' => $claimNumber,
                    'member_id' => $member->userID,
                    'status' => $status,
                    'claim_type' => ['new', 'renewal', 'replacement'][rand(0, 2)],
                    'scheduled_pickup_date' => in_array($status, [IDClaim::STATUS_SCHEDULED, IDClaim::STATUS_READY_FOR_PICKUP])
                        ? Carbon::now()->addDays(rand(1, 7)) 
                        : null,
                    'claimed_at' => $status === IDClaim::STATUS_CLAIMED 
                        ? Carbon::now()->subDays(rand(1, 30)) 
                        : null,
                    'notes' => 'Test ID claim record',
                ]);

                $claimCount++;
            } catch (\Exception $e) {
                // Log but continue
            }
        }

        $this->command->info("   Created {$claimCount} ID claims");
    }

    /**
     * Create member documents
     */
    protected function createMemberDocuments(): void
    {
        $this->command->info('📄 Creating member documents...');

        $requiredDocs = RequiredDocument::where('status', 'active')->get();
        if ($requiredDocs->isEmpty()) {
            $this->command->warn('   No required documents found, skipping document creation');
            return;
        }

        $documentStatuses = ['pending', 'approved', 'approved', 'approved', 'rejected'];
        $documentCount = 0;

        foreach ($this->createdMembers as $member) {
            // Each member has 2-4 documents
            $docsToCreate = $requiredDocs->random(min(rand(2, 4), $requiredDocs->count()));

            foreach ($docsToCreate as $requiredDoc) {
                try {
                    $status = $documentStatuses[array_rand($documentStatuses)];

                    MemberDocument::create([
                        'member_id' => $member->userID,
                        'required_document_id' => $requiredDoc->id,
                        'file_path' => 'member-documents/' . $member->userID . '/test_doc_' . $requiredDoc->id . '.pdf',
                        'file_name' => 'test_document_' . $requiredDoc->name . '.pdf',
                        'file_size' => rand(100000, 2000000),
                        'file_type' => 'application/pdf',
                        'uploaded_at' => Carbon::now()->subDays(rand(1, 60)),
                        'status' => $status,
                        'notes' => $status === 'rejected' ? 'Document is unclear, please re-upload' : null,
                        'reviewed_by' => $status !== 'pending' ? 1 : null,
                        'reviewed_at' => $status !== 'pending' ? now() : null,
                    ]);

                    $documentCount++;
                } catch (\Exception $e) {
                    // Skip duplicates
                }
            }
        }

        $this->command->info("   Created {$documentCount} member documents");
    }

    /**
     * Create notifications
     */
    protected function createNotifications(): void
    {
        $this->command->info('🔔 Creating notifications...');

        $notificationTypes = [
            ['type' => 'application_status', 'title' => 'Application Status Update', 'message' => 'Your application status has been updated.'],
            ['type' => 'benefit_announcement', 'title' => 'New Benefit Available', 'message' => 'A new benefit is now available for claiming.'],
            ['type' => 'document_reminder', 'title' => 'Document Reminder', 'message' => 'Please upload your required documents.'],
            ['type' => 'card_renewal_due', 'title' => 'Card Renewal Due', 'message' => 'Your PWD card is due for renewal.'],
            ['type' => 'assessment_scheduled', 'title' => 'Assessment Scheduled', 'message' => 'Your disability assessment has been scheduled.'],
            ['type' => 'ticket_update', 'title' => 'Support Ticket Update', 'message' => 'Your support ticket has been updated.'],
        ];

        $notificationCount = 0;

        foreach ($this->createdMembers as $member) {
            // Each member gets 1-5 notifications
            $numNotifications = rand(1, 5);

            for ($i = 0; $i < $numNotifications; $i++) {
                $notification = $notificationTypes[array_rand($notificationTypes)];

                try {
                    Notification::create([
                        'user_id' => $member->userID,
                        'type' => $notification['type'],
                        'title' => $notification['title'],
                        'message' => $notification['message'],
                        'is_read' => rand(0, 1) === 1,
                        'data' => json_encode(['test' => true]),
                        'created_at' => Carbon::now()->subDays(rand(0, 30)),
                    ]);

                    $notificationCount++;
                } catch (\Exception $e) {
                    // Skip errors
                }
            }
        }

        $this->command->info("   Created {$notificationCount} notifications");
    }

    /**
     * Create complaints
     */
    protected function createComplaints(): void
    {
        $this->command->info('📢 Creating complaints/feedback...');

        $subjects = [
            'Service Quality Feedback',
            'Document Processing Delay',
            'Benefits Distribution Issue',
            'Staff Assistance Feedback',
            'System Usability Feedback'
        ];

        $complaintCount = 0;

        // Get members from database
        $members = PWDMember::limit(50)->get();

        foreach ($members as $member) {
            // 40% of members have complaints
            if (rand(1, 100) > 40) continue;

            try {
                Complaint::create([
                    'pwdID' => $member->userID,
                    'subject' => $subjects[array_rand($subjects)],
                    'description' => 'This is a test complaint/feedback entry for testing purposes.',
                    'status' => ['Pending', 'In Progress', 'Resolved', 'Closed'][rand(0, 3)],
                ]);

                $complaintCount++;
            } catch (\Exception $e) {
                // Log but continue
            }
        }

        $this->command->info("   Created {$complaintCount} complaints");
    }

    /**
     * Create announcements
     */
    protected function createAnnouncements(): void
    {
        $this->command->info('📣 Creating announcements...');

        $announcements = [
            [
                'title' => 'Q1 2025 Financial Assistance Program',
                'content' => "We are pleased to announce the Q1 2025 Financial Assistance Program for all registered PWD members.\n\nPROGRAM DETAILS:\n• Amount: ₱5,000 per beneficiary\n• Eligibility: All active PWD members\n• Distribution: Starting January 15, 2025\n\nIMPORTANT:\n1. Bring your PWD ID\n2. Bring one valid government ID\n3. Claim in person or through authorized representative",
                'type' => 'Event',
                'priority' => 'High',
                'targetAudience' => 'All',
                'status' => 'Active'
            ],
            [
                'title' => 'Office Hours Update',
                'content' => "Please be informed of our updated office hours effective January 2025.\n\nNEW SCHEDULE:\n• Monday to Friday: 8:00 AM - 5:00 PM\n• Saturday: 8:00 AM - 12:00 NN\n• Sunday: Closed\n\nFor inquiries, please contact us at (049) 123-4567.",
                'type' => 'Notice',
                'priority' => 'Medium',
                'targetAudience' => 'Members',
                'status' => 'Active'
            ],
            [
                'title' => 'PWD ID Renewal Reminder',
                'content' => "This is a reminder for all PWD members whose IDs are expiring within the next 3 months.\n\nRENEWAL REQUIREMENTS:\n• Old PWD ID\n• Updated Medical Certificate\n• 2x2 ID Photo (2 copies)\n• Barangay Certificate of Residency\n\nPlease visit the PDAO office for renewal.",
                'type' => 'Reminder',
                'priority' => 'High',
                'targetAudience' => 'Members',
                'status' => 'Active'
            ],
            [
                'title' => 'System Maintenance Notice',
                'content' => "The PWD Management System will undergo scheduled maintenance on January 20, 2025 from 10:00 PM to 2:00 AM.\n\nDuring this time, the system will be unavailable. We apologize for any inconvenience.",
                'type' => 'System Update',
                'priority' => 'Medium',
                'targetAudience' => 'All',
                'status' => 'Active'
            ],
            [
                'title' => 'Birthday Cash Gift - Q1 2025',
                'content' => "Happy Birthday to all PWD members celebrating their birthdays in January, February, and March!\n\nCLAIM DETAILS:\n• Amount: ₱2,000\n• Claiming Period: Your birth month\n• Requirements: PWD ID, Valid Government ID\n\nGod bless and have a wonderful birthday!",
                'type' => 'Event',
                'priority' => 'High',
                'targetAudience' => 'Members',
                'status' => 'Active'
            ]
        ];

        // Add barangay-specific announcements
        foreach (['Banlic', 'Mamatid', 'Bigaa'] as $barangay) {
            $announcements[] = [
                'title' => "Special Assistance Program - {$barangay}",
                'content' => "Special assistance program for PWD members in {$barangay}.\n\nPlease visit your barangay hall for more information.",
                'type' => 'Event',
                'priority' => 'Medium',
                'targetAudience' => $barangay,
                'status' => 'Active'
            ];
        }

        foreach ($announcements as $announcementData) {
            try {
                Announcement::create([
                    'authorID' => 1, // Admin user
                    'title' => $announcementData['title'],
                    'content' => $announcementData['content'],
                    'type' => $announcementData['type'],
                    'priority' => $announcementData['priority'],
                    'targetAudience' => $announcementData['targetAudience'],
                    'status' => $announcementData['status'],
                    'publishDate' => Carbon::now()->subDays(rand(0, 7)),
                    'expiryDate' => Carbon::now()->addMonths(rand(1, 3)),
                    'views' => rand(10, 500),
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed to create announcement', ['error' => $e->getMessage()]);
            }
        }

        $this->command->info('   Created ' . count($announcements) . ' announcements');
    }

    /**
     * Get submission date based on status
     */
    protected function getSubmissionDateForStatus(string $status): Carbon
    {
        return match($status) {
            'Pending' => Carbon::now()->subDays(rand(1, 3)),
            'Pending Barangay Approval' => Carbon::now()->subDays(rand(3, 7)),
            'For Assessment' => Carbon::now()->subDays(rand(5, 14)),
            'Pending Admin Approval' => Carbon::now()->subDays(rand(7, 14)),
            'Approved' => Carbon::now()->subDays(rand(14, 90)),
            'Rejected' => Carbon::now()->subDays(rand(7, 30)),
            'Under Review' => Carbon::now()->subDays(rand(3, 10)),
            'Needs Additional Documents' => Carbon::now()->subDays(rand(5, 14)),
            'Expired' => Carbon::now()->subDays(rand(30, 90)),
            'For Claiming' => Carbon::now()->subDays(rand(14, 30)),
            'For Renewal' => Carbon::now()->subDays(rand(365, 730)),
            default => Carbon::now()->subDays(rand(1, 30))
        };
    }

    /**
     * Get remarks based on status
     */
    protected function getRemarksForStatus(string $status): ?string
    {
        return match($status) {
            'Rejected' => ['Incomplete documents', 'Invalid medical certificate', 'Not eligible for PWD benefits'][rand(0, 2)],
            'Needs Additional Documents' => 'Please upload the following: Updated medical certificate',
            'Under Review' => 'Application is being reviewed by the admin',
            'Expired' => 'Application expired due to inactivity',
            default => null
        };
    }

    /**
     * Print summary of created data
     */
    protected function printSummary(): void
    {
        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════════════════');
        $this->command->info('               TEST DATA SUMMARY                    ');
        $this->command->info('═══════════════════════════════════════════════════');
        $this->command->newLine();

        // Applications by status
        $this->command->info('📝 Applications by Status:');
        foreach ($this->applicationStatuses as $status => $count) {
            $actual = isset($this->createdApplications[$status]) ? count($this->createdApplications[$status]) : 0;
            $this->command->line("   • {$status}: {$actual}");
        }
        $this->command->newLine();

        // Members
        $this->command->info('👥 PWD Members Created: ' . count($this->createdMembers));
        
        // Distribution by barangay
        $this->command->info('🏘️ Distribution by Barangay:');
        $barangayCounts = [];
        foreach ($this->createdMembers as $member) {
            $barangay = $member->barangay;
            $barangayCounts[$barangay] = ($barangayCounts[$barangay] ?? 0) + 1;
        }
        arsort($barangayCounts);
        foreach (array_slice($barangayCounts, 0, 6) as $barangay => $count) {
            $this->command->line("   • {$barangay}: {$count}");
        }
        $this->command->line("   • ... and " . (count($barangayCounts) - 6) . " more barangays");
        
        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════════════════');
        $this->command->info('🔐 Default Test Account Credentials:');
        $this->command->line('   Password: Test@123');
        $this->command->newLine();
        $this->command->info('📧 Test Email Pattern: [firstname][middlename][lastname][number]@testpwd.com');
        $this->command->info('═══════════════════════════════════════════════════');
    }
}

