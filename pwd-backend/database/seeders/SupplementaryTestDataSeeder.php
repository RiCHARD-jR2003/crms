<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PWDMember;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\IDClaim;
use App\Models\Complaint;
use App\Models\DisabilityAssessment;
use App\Models\Application;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SupplementaryTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds to add missing test data.
     */
    public function run(): void
    {
        $this->command->info('🔧 Adding supplementary test data...');

        DB::beginTransaction();

        try {
            // 1. Create Support Tickets
            $this->createSupportTickets();

            // 2. Create ID Claims
            $this->createIDClaims();

            // 3. Create Complaints
            $this->createComplaints();

            // 4. Create more Disability Assessments
            $this->createDisabilityAssessments();

            DB::commit();

            $this->command->info('✅ Supplementary test data added successfully!');
            $this->printSummary();

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('❌ Error: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function createSupportTickets(): void
    {
        $this->command->info('🎫 Creating support tickets...');

        $categories = [
            'Application Issue', 'ID Card Problem', 'Benefits Inquiry',
            'Account Access', 'Document Upload', 'General Inquiry', 'Technical Support'
        ];

        $priorities = ['low', 'medium', 'high', 'urgent'];
        $statuses = ['open', 'in_progress', 'waiting_for_reply', 'resolved', 'closed'];

        $subjects = [
            'Cannot upload documents',
            'Application status not updating',
            'Benefits claim not processed',
            'Cannot login to account',
            'ID card renewal inquiry',
            'Need assistance with application',
            'Document rejected - need help',
            'When will I receive my benefits?',
            'Question about eligibility',
            'System error while submitting'
        ];

        $members = PWDMember::limit(40)->get();
        $ticketCount = 0;

        foreach ($members as $member) {
            $numTickets = rand(1, 2);
            
            for ($i = 0; $i < $numTickets; $i++) {
                $status = $statuses[array_rand($statuses)];
                $ticketNumber = 'TKT-' . date('Y') . '-' . str_pad($ticketCount + 1, 6, '0', STR_PAD_LEFT);

                try {
                    $ticket = SupportTicket::create([
                        'ticket_number' => $ticketNumber,
                        'pwd_member_id' => $member->userID,
                        'subject' => $subjects[array_rand($subjects)],
                        'description' => 'This is a test support ticket. I need assistance with my issue regarding my PWD registration and benefits.',
                        'category' => $categories[array_rand($categories)],
                        'priority' => $priorities[array_rand($priorities)],
                        'status' => $status,
                        'created_at' => Carbon::now()->subDays(rand(1, 60)),
                    ]);

                    // Add initial message if SupportTicketMessage table exists
                    try {
                        SupportTicketMessage::create([
                            'support_ticket_id' => $ticket->id,
                            'sender_type' => 'pwd_member',
                            'sender_id' => $member->userID,
                            'message' => 'This is a test support ticket message. I need assistance with my issue regarding my PWD registration and benefits.',
                        ]);

                        // Add staff reply for some tickets
                        if (in_array($status, ['in_progress', 'waiting_for_reply', 'resolved', 'closed'])) {
                            SupportTicketMessage::create([
                                'support_ticket_id' => $ticket->id,
                                'sender_type' => 'admin',
                                'sender_id' => 1,
                                'message' => 'Thank you for contacting us. We are looking into your issue and will get back to you shortly.',
                            ]);
                        }
                    } catch (\Exception $msgEx) {
                        // Messages table might have different structure, continue anyway
                    }

                    $ticketCount++;
                } catch (\Exception $e) {
                    continue;
                }
            }
        }

        $this->command->info("   Created {$ticketCount} support tickets");
    }

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

        $claimantTypes = [
            IDClaim::CLAIMANT_MEMBER,
            IDClaim::CLAIMANT_GUARDIAN,
            IDClaim::CLAIMANT_REPRESENTATIVE
        ];

        $members = PWDMember::limit(30)->get();
        $claimCount = 0;

        foreach ($members as $member) {
            if (rand(1, 100) > 40) continue; // 60% chance

            $status = $claimStatuses[array_rand($claimStatuses)];
            $claimantType = $claimantTypes[array_rand($claimantTypes)];

            try {
                $claimData = [
                    'member_id' => $member->userID,
                    'status' => $status,
                    'claim_type' => ['new', 'renewal'][rand(0, 1)],
                    'claimant_type' => $claimantType,
                    'notes' => 'Test ID claim record',
                ];

                // Add claimant info for non-member claimants
                if ($claimantType !== IDClaim::CLAIMANT_MEMBER) {
                    $claimData['claimant_name'] = 'Test Claimant ' . $claimCount;
                    $claimData['claimant_relationship'] = ['Parent', 'Sibling', 'Spouse', 'Child'][rand(0, 3)];
                    $claimData['claimant_contact'] = '09' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT);
                }

                // Add scheduling info for scheduled claims
                if (in_array($status, [IDClaim::STATUS_SCHEDULED, IDClaim::STATUS_READY_FOR_PICKUP])) {
                    $claimData['scheduled_pickup_date'] = Carbon::now()->addDays(rand(1, 7));
                    $claimData['scheduled_pickup_time'] = ['09:00', '10:00', '11:00', '14:00', '15:00'][rand(0, 4)];
                }

                // Add claimed info for completed claims
                if ($status === IDClaim::STATUS_CLAIMED) {
                    $claimData['claimed_at'] = Carbon::now()->subDays(rand(1, 30));
                    $claimData['receipt_number'] = IDClaim::generateReceiptNumber();
                }

                IDClaim::create($claimData);
                $claimCount++;
            } catch (\Exception $e) {
                // Continue on error
            }
        }

        $this->command->info("   Created {$claimCount} ID claims");
    }

    protected function createComplaints(): void
    {
        $this->command->info('📢 Creating complaints/feedback...');

        $subjects = [
            'Service Quality Feedback',
            'Document Processing Delay',
            'Benefits Distribution Issue',
            'Staff Assistance Feedback',
            'System Usability Feedback',
            'Long waiting time at office',
            'Inquiry about application process',
            'Request for faster processing'
        ];

        $members = PWDMember::limit(30)->get();
        $complaintCount = 0;

        foreach ($members as $member) {
            if (rand(1, 100) > 50) continue;

            try {
                Complaint::create([
                    'pwdID' => $member->userID,
                    'subject' => $subjects[array_rand($subjects)],
                    'description' => 'This is a test complaint/feedback entry. The system needs to process requests faster and provide better communication regarding application status updates.',
                    'status' => ['Pending', 'In Progress', 'Resolved', 'Closed'][rand(0, 3)],
                ]);

                $complaintCount++;
            } catch (\Exception $e) {
                continue;
            }
        }

        $this->command->info("   Created {$complaintCount} complaints");
    }

    protected function createDisabilityAssessments(): void
    {
        $this->command->info('📋 Creating disability assessments...');

        $applications = Application::where('status', 'For Assessment')
            ->whereDoesntHave('disabilityAssessment')
            ->get();

        $assessmentCount = 0;
        $existingCount = DisabilityAssessment::count();

        foreach ($applications as $application) {
            $statuses = [
                DisabilityAssessment::STATUS_PENDING,
                DisabilityAssessment::STATUS_SCHEDULED,
                DisabilityAssessment::STATUS_COMPLETED,
                DisabilityAssessment::STATUS_FINALIZED
            ];
            $status = $statuses[array_rand($statuses)];

            try {
                $referenceNumber = 'DA-' . date('Y') . '-' . str_pad($existingCount + $assessmentCount + 1, 5, '0', STR_PAD_LEFT);

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
                    'disability_description' => 'Test disability description for assessment purposes.',
                    'disability_severity' => ['mild', 'moderate', 'severe', 'profound'][rand(0, 3)],
                    'assessed_by' => in_array($status, [DisabilityAssessment::STATUS_COMPLETED, DisabilityAssessment::STATUS_FINALIZED]) ? 1 : null,
                    'assessed_at' => in_array($status, [DisabilityAssessment::STATUS_COMPLETED, DisabilityAssessment::STATUS_FINALIZED]) ? now() : null,
                ]);

                $assessmentCount++;
            } catch (\Exception $e) {
                continue;
            }
        }

        $this->command->info("   Created {$assessmentCount} disability assessments");
    }

    protected function printSummary(): void
    {
        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════════════════');
        $this->command->info('          SUPPLEMENTARY DATA SUMMARY               ');
        $this->command->info('═══════════════════════════════════════════════════');
        $this->command->info('Total Support Tickets: ' . SupportTicket::count());
        $this->command->info('Total ID Claims: ' . IDClaim::count());
        $this->command->info('Total Complaints: ' . Complaint::count());
        $this->command->info('Total Disability Assessments: ' . DisabilityAssessment::count());
        $this->command->info('═══════════════════════════════════════════════════');
    }
}

