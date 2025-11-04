<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class Generate1000SamplePWDMembersSeeder extends Seeder
{
    protected $totalRecords = 1000;

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Allow override via environment variable
        $this->totalRecords = env('SAMPLE_PWD_COUNT', 1000);
        
        if ($this->totalRecords > 10000) {
            $this->totalRecords = 10000; // Limit to 10000 for safety
        }
        // All 18 Barangays in Cabuyao
        $barangays = [
            'Baclaran',
            'Banay-Banay',
            'Banlic',
            'Bigaa',
            'Butong',
            'Casile',
            'Diezmo',
            'Gulod',
            'Mamatid',
            'Marinig',
            'Niugan',
            'Pittland',
            'Pulo',
            'Sala',
            'San Isidro',
            'Barangay I Poblacion',
            'Barangay II Poblacion',
            'Barangay III Poblacion'
        ];

        // Disability types
        $disabilityTypes = [
            'Visual Impairment',
            'Hearing Impairment',
            'Speech and Language Impairment',
            'Intellectual Disability',
            'Mental Health Condition',
            'Learning Disability',
            'Psychosocial Disability',
            'Autism Spectrum Disorder',
            'ADHD',
            'Physical Disability',
            'Orthopedic/Physical Disability',
            'Chronic Illness',
            'Multiple Disabilities'
        ];

        // Application statuses with distribution weights
        $statuses = [
            'Approved' => 600,           // 60% approved
            'Pending Admin Approval' => 150,  // 15% pending admin
            'Pending Barangay Approval' => 150, // 15% pending barangay
            'Under Review' => 50,        // 5% under review
            'Needs Additional Documents' => 30, // 3% needs docs
            'Rejected' => 20             // 2% rejected
        ];

        // First names (Filipino names)
        $firstNames = [
            'Maria', 'Jose', 'Juan', 'Antonio', 'Francisco', 'Manuel', 'Pedro', 'Carlos',
            'Rosa', 'Carmen', 'Elena', 'Ana', 'Rosa', 'Teresa', 'Josefa', 'Patricia',
            'Rodrigo', 'Miguel', 'Fernando', 'Ricardo', 'Eduardo', 'Roberto', 'Alberto',
            'Marco', 'Luis', 'Sofia', 'Isabella', 'Andrea', 'Gabriela', 'Valentina',
            'Diego', 'Sebastian', 'Matias', 'Samuel', 'Benjamin', 'Daniel', 'Leonardo',
            'Ramon', 'Felix', 'Enrique', 'Alfredo', 'Mariano', 'Julio', 'Victor',
            'Rafael', 'Alejandro', 'Sergio', 'Javier', 'Andres', 'Felipe', 'Ignacio',
            'Cristina', 'Margarita', 'Laura', 'Monica', 'Lucia', 'Paula', 'Claudia',
            'Victoria', 'Adriana', 'Beatriz', 'Catalina', 'Diana', 'Esperanza', 'Felicia',
            'Gloria', 'Herminia', 'Imelda', 'Jocelyn', 'Karina', 'Lourdes', 'Marcela',
            'Natalia', 'Olga', 'Patricia', 'Querida', 'Ramona', 'Soledad', 'Trinidad',
            'Ursula', 'Veronica', 'Wilma', 'Ximena', 'Yolanda', 'Zenaida', 'Aurora',
            'Belen', 'Corazon', 'Dolores', 'Ester', 'Flora', 'Graciela', 'Helena'
        ];

        // Last names (Filipino names)
        $lastNames = [
            'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres',
            'Delos Santos', 'Ramos', 'Gonzales', 'Villanueva', 'Fernandez', 'Lopez', 'Sanchez',
            'Rivera', 'Gomez', 'Diaz', 'Morales', 'Castro', 'Ortiz', 'Vargas', 'Romero',
            'Jimenez', 'Herrera', 'Moreno', 'Flores', 'Silva', 'Martinez', 'Medina',
            'Alvarez', 'Ruiz', 'Delgado', 'Castillo', 'Ortega', 'Soto', 'Rodriguez',
            'Perez', 'Gutierrez', 'Chavez', 'Rojas', 'Molina', 'Navarro', 'Marquez',
            'Vega', 'Paredes', 'Salazar', 'Dominguez', 'Campos', 'Mendez', 'Acosta',
            'Guerrero', 'Vasquez', 'Valdez', 'Sandoval', 'Velasco', 'Aguilar', 'Benitez',
            'Bravo', 'Calderon', 'Cardenas', 'De Leon', 'Espinoza', 'Fuentes', 'Galvan',
            'Ibarra', 'Juarez', 'Kumar', 'Luna', 'Maldonado', 'Nunez', 'Ochoa',
            'Pacheco', 'Quintero', 'Rios', 'Suarez', 'Trujillo', 'Uribe', 'Valenzuela',
            'Zamora', 'Aguirre', 'Beltran', 'Cervantes', 'Duran', 'Escobar', 'Fuentes',
            'Guerra', 'Herrera', 'Ibarra', 'Jaramillo', 'Khan', 'Lara', 'Machado'
        ];

        // Middle names
        $middleNames = [
            'Cruz', 'Reyes', 'Santos', 'Garcia', 'Ramos', 'Mendoza', 'Lopez', 'Torres',
            'Delos Santos', 'Villanueva', 'Fernandez', 'Sanchez', 'Rivera', 'Gomez',
            'Diaz', 'Morales', 'Castro', 'Ortiz', 'Vargas', 'Romero', 'Jimenez',
            'Herrera', 'Moreno', 'Flores', 'Silva', 'Martinez', 'Medina', 'Alvarez',
            'Ruiz', 'Delgado', 'Castillo', 'Ortega', 'Soto', 'Rodriguez', 'Perez',
            'Gutierrez', 'Chavez', 'Rojas', 'Molina', 'Navarro', null, null, null
        ];

        // Suffixes
        $suffixes = [null, null, null, null, null, null, null, null, null, null, 'Jr.', 'Sr.', 'II', 'III'];

        // Genders
        $genders = ['Male', 'Female', 'Other'];

        // ID Types
        $idTypes = ['National ID', 'Passport', 'Driver\'s License', 'SSS ID', 'TIN ID', 'PhilHealth ID'];

        // Emergency relationships
        $relationships = ['Spouse', 'Parent', 'Sibling', 'Child', 'Relative', 'Friend', 'Guardian'];

        // Civil statuses
        $civilStatuses = ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'];

        // Disability causes
        $disabilityCauses = [
            'Birth defect',
            'Accident',
            'Illness',
            'Age-related',
            'Work-related injury',
            'Genetic condition',
            'Unknown',
            'Other'
        ];

        $insertedUsers = 0;
        $insertedMembers = 0;
        $insertedApplications = 0;
        $insertedSupportTickets = 0;
        $insertedBenefits = 0;
        $insertedBenefitClaims = 0;

        echo "Starting to generate {$this->totalRecords} sample PWD members and applications...\n";

        // Get the next available userID
        $lastUserID = DB::table('users')->max('userID') ?? 0;
        $startUserID = $lastUserID + 1;

        // Generate status distribution
        $statusDistribution = [];
        foreach ($statuses as $status => $count) {
            for ($i = 0; $i < $count; $i++) {
                $statusDistribution[] = $status;
            }
        }
        shuffle($statusDistribution);

        // Process in batches of 100 for better performance
        $batchSize = 100;
        $batches = ceil($this->totalRecords / $batchSize);

        for ($batch = 0; $batch < $batches; $batch++) {
            $users = [];
            $members = [];
            $applications = [];

            $startIdx = $batch * $batchSize;
            $endIdx = min($startIdx + $batchSize, $this->totalRecords);

            for ($i = $startIdx; $i < $endIdx; $i++) {
                $currentUserID = $startUserID + $i;
                
                // Generate random data
                $firstName = $firstNames[array_rand($firstNames)];
                $lastName = $lastNames[array_rand($lastNames)];
                $middleName = $middleNames[array_rand($middleNames)];
                $suffix = $suffixes[array_rand($suffixes)];
                $gender = $genders[array_rand($genders)];
                $barangay = $barangays[array_rand($barangays)];
                $disabilityType = $disabilityTypes[array_rand($disabilityTypes)];
                $status = $statusDistribution[$i % count($statusDistribution)];

                // Generate unique email using userID and microtime
                $microtime = str_replace('.', '', microtime(true));
                $uniqueId = $currentUserID . '_' . $microtime . '_' . rand(10000, 99999);
                $email = 'pwd' . $uniqueId . '@sample.pwd.local';
                $username = 'pwd_' . $currentUserID . '_' . strtolower(preg_replace('/[^a-z0-9]/', '', $firstName . $lastName)) . '_' . $currentUserID;

                // Generate birth date (between 18 and 80 years old)
                $birthYear = rand(1945, 2006);
                $birthMonth = rand(1, 12);
                $birthDay = rand(1, 28);
                $birthDate = Carbon::create($birthYear, $birthMonth, $birthDay);

                // Generate submission date (within last 2 years)
                $submissionDate = Carbon::now()->subDays(rand(0, 730));

                // Generate contact number
                $contactNumber = '09' . str_pad(rand(0, 999999999), 9, '0', STR_PAD_LEFT);

                // Generate address
                $streetNumber = rand(1, 999);
                $streetNames = ['Rizal', 'Mabini', 'Bonifacio', 'Luna', 'Aguinaldo', 'Quezon', 'Roxas', 'Osmena'];
                $streetName = $streetNames[array_rand($streetNames)];
                $address = "{$streetNumber} {$streetName} Street, {$barangay}, Cabuyao, Laguna";

                // Generate PWD ID
                $pwdId = 'PWD-' . str_pad($currentUserID, 6, '0', STR_PAD_LEFT);

                // Generate emergency contact
                $emergencyFirstName = $firstNames[array_rand($firstNames)];
                $emergencyLastName = $lastNames[array_rand($lastNames)];
                $emergencyContact = $emergencyFirstName . ' ' . $emergencyLastName;
                $emergencyPhone = '09' . str_pad(rand(0, 999999999), 9, '0', STR_PAD_LEFT);
                $emergencyRelationship = $relationships[array_rand($relationships)];

                // Generate ID number
                $idType = $idTypes[array_rand($idTypes)];
                $idNumber = str_pad(rand(0, 999999999), 10, '0', STR_PAD_LEFT);

                // Generate disability date (before birth date or after)
                $disabilityDate = $birthDate->copy()->addYears(rand(0, 60))->addDays(rand(0, 365));

                // Prepare user data
                $users[] = [
                    'userID' => $currentUserID,
                    'username' => $username,
                    'email' => $email,
                    'password' => Hash::make('password123'), // Default password
                    'role' => 'PWDMember',
                    'status' => 'active',
                    'created_at' => $submissionDate,
                    'updated_at' => $submissionDate,
                ];

                // Prepare PWD member data (only for approved applications)
                if ($status === 'Approved') {
                    $members[] = [
                        'userID' => $currentUserID,
                        'pwd_id' => $pwdId,
                        'pwd_id_generated_at' => $submissionDate,
                        'firstName' => $firstName,
                        'lastName' => $lastName,
                        'middleName' => $middleName,
                        'suffix' => $suffix,
                        'birthDate' => $birthDate->format('Y-m-d'),
                        'gender' => $gender,
                        'disabilityType' => $disabilityType,
                        'address' => $address,
                        'contactNumber' => $contactNumber,
                        'email' => $email,
                        'barangay' => $barangay,
                        'emergencyContact' => $emergencyContact,
                        'emergencyPhone' => $emergencyPhone,
                        'emergencyRelationship' => $emergencyRelationship,
                        'status' => 'Active',
                        'created_at' => $submissionDate,
                        'updated_at' => $submissionDate,
                    ];
                }

                // Generate reference number
                $referenceNumber = 'REF-' . date('Y') . '-' . str_pad($currentUserID, 6, '0', STR_PAD_LEFT);

                // Prepare application data
                $applications[] = [
                    'referenceNumber' => $referenceNumber,
                    'pwdID' => $status === 'Approved' ? $currentUserID : null,
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                    'middleName' => $middleName,
                    'suffix' => $suffix,
                    'birthDate' => $birthDate->format('Y-m-d'),
                    'gender' => $gender,
                    'civilStatus' => $civilStatuses[array_rand($civilStatuses)],
                    'nationality' => 'Filipino',
                    'disabilityType' => $disabilityType,
                    'disabilityCause' => $disabilityCauses[array_rand($disabilityCauses)],
                    'disabilityDate' => $disabilityDate->format('Y-m-d'),
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
                    'idType' => $idType,
                    'idNumber' => $idNumber,
                    'submissionDate' => $submissionDate->format('Y-m-d'),
                    'status' => $status,
                    'remarks' => $status === 'Approved' ? 'Sample approved application' : null,
                    'created_at' => $submissionDate,
                    'updated_at' => $submissionDate,
                ];
            }

            // Insert users
            if (!empty($users)) {
                DB::table('users')->insert($users);
                $insertedUsers += count($users);
            }

            // Insert PWD members
            if (!empty($members)) {
                DB::table('pwd_members')->insert($members);
                $insertedMembers += count($members);
            }

            // Insert applications
            if (!empty($applications)) {
                DB::table('application')->insert($applications);
                $insertedApplications += count($applications);
            }

            echo "Batch " . ($batch + 1) . "/{$batches} completed: {$insertedUsers} users, {$insertedMembers} members, {$insertedApplications} applications\n";
        }

        echo "\n=== SUMMARY ===\n";
        echo "Total Users Created: {$insertedUsers}\n";
        echo "Total PWD Members Created: {$insertedMembers}\n";
        echo "Total Applications Created: {$insertedApplications}\n";
        echo "\nDistribution by Status:\n";
        
        // Count all applications we just created (from the last batch)
        $lastApplicationID = DB::table('application')->max('applicationID');
        $firstApplicationID = $lastApplicationID - $insertedApplications + 1;
        
        foreach ($statuses as $status => $count) {
            $actualCount = DB::table('application')
                ->where('status', $status)
                ->where('applicationID', '>=', $firstApplicationID)
                ->where('applicationID', '<=', $lastApplicationID)
                ->count();
            echo "  {$status}: {$actualCount}\n";
        }

        echo "\n✅ Sample data generation completed successfully!\n";
        echo "Default password for all users: password123\n";
        
        // Generate support tickets, benefits, and benefit claims
        echo "\n=== Generating Support Tickets, Benefits, and Benefit Claims ===\n";
        $this->generateSupportTicketsAndBenefits();
    }

    /**
     * Generate support tickets, benefits, and benefit claims
     */
    protected function generateSupportTicketsAndBenefits()
    {
        // Get all PWD members (only approved ones) - ensure they exist in pwd_members table
        $pwdMembers = DB::table('pwd_members')
            ->select('id', 'userID', 'firstName', 'lastName', 'email')
            ->whereNotNull('userID')
            ->get();

        if ($pwdMembers->isEmpty()) {
            echo "No PWD members found. Skipping support tickets and benefits generation.\n";
            return;
        }

        echo "Found " . $pwdMembers->count() . " PWD members for generating tickets and benefits.\n";

        $barangays = [
            'Baclaran', 'Banay-Banay', 'Banlic', 'Bigaa', 'Butong', 'Casile',
            'Diezmo', 'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'Pittland',
            'Pulo', 'Sala', 'San Isidro', 'Barangay I Poblacion', 'Barangay II Poblacion', 'Barangay III Poblacion'
        ];

        // Support ticket subjects and descriptions
        $ticketSubjects = [
            'PWD ID Card Issue',
            'Application Status Inquiry',
            'Benefit Claim Assistance',
            'Document Submission Help',
            'Account Access Problem',
            'Password Reset Request',
            'Card Delivery Inquiry',
            'Address Update Request',
            'Contact Information Update',
            'Benefits Eligibility Question',
            'Medical Certificate Help',
            'Registration Process Inquiry',
            'Technical Support Needed',
            'Payment Method Question',
            'Complaint About Service'
        ];

        $ticketDescriptions = [
            'I have not received my PWD ID card yet. Can you please check the status?',
            'I submitted my application last month and would like to know the current status.',
            'I need help with claiming my benefits. How do I proceed?',
            'I am having trouble uploading my documents. Can you assist me?',
            'I cannot log into my account. Please help me regain access.',
            'I forgot my password and need to reset it.',
            'When will my PWD card be delivered?',
            'I moved to a new address and need to update my information.',
            'I need to update my contact number and email address.',
            'Can you clarify what benefits I am eligible for?',
            'What medical certificate do I need to submit?',
            'I am confused about the registration process. Can you guide me?',
            'I am experiencing technical issues with the website.',
            'What payment methods are accepted for benefits?',
            'I would like to file a complaint about the service I received.'
        ];

        $ticketCategories = [
            'General Inquiry',
            'Technical Support',
            'Application',
            'Benefits',
            'Account Issues',
            'Documentation',
            'Complaint'
        ];

        $ticketStatuses = [
            'open' => 40,
            'in_progress' => 30,
            'resolved' => 20,
            'closed' => 10
        ];

        $ticketPriorities = [
            'low' => 30,
            'medium' => 40,
            'high' => 25,
            'urgent' => 5
        ];

        // Generate status and priority distributions
        $statusDistribution = [];
        foreach ($ticketStatuses as $status => $count) {
            for ($i = 0; $i < $count; $i++) {
                $statusDistribution[] = $status;
            }
        }
        shuffle($statusDistribution);

        $priorityDistribution = [];
        foreach ($ticketPriorities as $priority => $count) {
            for ($i = 0; $i < $count; $i++) {
                $priorityDistribution[] = $priority;
            }
        }
        shuffle($priorityDistribution);

        // Generate support tickets (about 30% of PWD members will have tickets)
        $ticketCount = min((int)($pwdMembers->count() * 0.3), 300);
        $pwdMembersArray = $pwdMembers->toArray();
        shuffle($pwdMembersArray);
        $selectedMembers = array_slice($pwdMembersArray, 0, $ticketCount);
        
        $supportTickets = [];
        $ticketMessages = [];
        $lastTicketId = DB::table('support_tickets')->max('id') ?? 0;

        foreach ($selectedMembers as $index => $member) {
            $memberObj = is_object($member) ? $member : (object)$member;
            $ticketId = $lastTicketId + $index + 1;
            $ticketNumber = 'SUP-' . str_pad($ticketId, 6, '0', STR_PAD_LEFT);
            $status = $statusDistribution[$index % count($statusDistribution)];
            $priority = $priorityDistribution[$index % count($priorityDistribution)];
            $subject = $ticketSubjects[array_rand($ticketSubjects)];
            $description = $ticketDescriptions[array_rand($ticketDescriptions)];
            $category = $ticketCategories[array_rand($ticketCategories)];
            
            $createdAt = Carbon::now()->subDays(rand(0, 180));
            $resolvedAt = null;
            $closedAt = null;
            
            if (in_array($status, ['resolved', 'closed'])) {
                $resolvedAt = $createdAt->copy()->addDays(rand(1, 7));
                if ($status === 'closed') {
                    $closedAt = $resolvedAt->copy()->addDays(rand(1, 3));
                }
            }

            $supportTickets[] = [
                'ticket_number' => $ticketNumber,
                'subject' => $subject,
                'description' => $description,
                'pwd_member_id' => $memberObj->id, // References pwd_members.id
                'status' => $status,
                'priority' => $priority,
                'category' => $category,
                'resolved_at' => $resolvedAt,
                'closed_at' => $closedAt,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];

            // Create initial message from PWD member (will be updated with actual ticket ID after insertion)
            $ticketMessages[] = [
                'ticket_number' => $ticketNumber, // Temporary reference
                'message' => $description,
                'sender_type' => 'pwd_member',
                'sender_id' => $memberObj->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];

            // Add admin reply for resolved/closed tickets
            if (in_array($status, ['resolved', 'closed', 'in_progress'])) {
                $adminReplies = [
                    'Thank you for contacting us. We have received your inquiry and will process it shortly.',
                    'Your request has been reviewed and is being processed.',
                    'We have resolved your issue. Please let us know if you need any further assistance.',
                    'Your ticket has been closed. Thank you for using our services.',
                    'We have updated your account information as requested.',
                    'Your application has been reviewed and approved.',
                    'Your benefits claim has been processed successfully.'
                ];
                
                $replyDate = $createdAt->copy()->addHours(rand(1, 72));
                $ticketMessages[] = [
                    'ticket_number' => $ticketNumber, // Temporary reference
                    'message' => $adminReplies[array_rand($adminReplies)],
                    'sender_type' => 'admin',
                    'sender_id' => 1, // Assuming admin userID is 1
                    'created_at' => $replyDate,
                    'updated_at' => $replyDate,
                ];
            }
        }

        // Insert support tickets in batches
        $batchSize = 50;
        $batches = array_chunk($supportTickets, $batchSize);
        foreach ($batches as $batch) {
            DB::table('support_tickets')->insert($batch);
        }
        
        // Get the actual inserted ticket IDs
        $insertedTickets = DB::table('support_tickets')
            ->whereIn('ticket_number', array_column($supportTickets, 'ticket_number'))
            ->get()
            ->keyBy('ticket_number');

        // Update ticket message IDs with actual ticket IDs
        $finalMessages = [];
        foreach ($ticketMessages as $msg) {
            $ticketNumber = $msg['ticket_number'];
            $actualTicketId = $insertedTickets[$ticketNumber]->id ?? null;
            if ($actualTicketId) {
                unset($msg['ticket_number']); // Remove temporary reference
                $msg['support_ticket_id'] = $actualTicketId;
                $finalMessages[] = $msg;
            }
        }

        // Insert ticket messages
        if (!empty($finalMessages)) {
            $messageBatches = array_chunk($finalMessages, $batchSize);
            foreach ($messageBatches as $batch) {
                DB::table('support_ticket_messages')->insert($batch);
            }
        }

        $insertedSupportTickets = count($supportTickets);
        echo "Generated {$insertedSupportTickets} support tickets with messages.\n";

        // Create benefits (Ayuda)
        $benefits = [
            [
                'title' => 'Financial Assistance Program Q1 2025',
                'type' => 'Financial Assistance',
                'amount' => '5000',
                'description' => 'Quarterly financial assistance for PWD members',
                'status' => 'Active',
                'distributed' => 0,
                'pending' => 0,
                'submittedDate' => Carbon::now()->subMonths(2),
                'approvedDate' => Carbon::now()->subMonths(1),
                'distributionDate' => Carbon::now()->subDays(30),
                'expiryDate' => Carbon::now()->addMonths(2),
                'selectedBarangays' => json_encode($barangays),
                'color' => '#3498DB',
            ],
            [
                'title' => 'Financial Assistance Program Q2 2025',
                'type' => 'Financial Assistance',
                'amount' => '5000',
                'description' => 'Quarterly financial assistance for PWD members',
                'status' => 'Active',
                'distributed' => 0,
                'pending' => 0,
                'submittedDate' => Carbon::now()->subDays(15),
                'approvedDate' => Carbon::now()->subDays(10),
                'distributionDate' => Carbon::now()->addDays(30),
                'expiryDate' => Carbon::now()->addMonths(5),
                'selectedBarangays' => json_encode($barangays),
                'color' => '#3498DB',
            ],
            [
                'title' => 'Birthday Cash Gift - January to March',
                'type' => 'Birthday Cash Gift',
                'amount' => '1000',
                'description' => 'Cash gift on birthday for PWD members born in Q1',
                'status' => 'Active',
                'distributed' => 0,
                'pending' => 0,
                'submittedDate' => Carbon::now()->subMonths(2),
                'approvedDate' => Carbon::now()->subMonths(1),
                'distributionDate' => Carbon::now()->subDays(60),
                'expiryDate' => Carbon::now()->addMonths(1),
                'quarter' => 'Q1',
                'birthdayMonth' => 'January',
                'barangay' => null,
                'color' => '#E74C3C',
            ],
            [
                'title' => 'Birthday Cash Gift - April to June',
                'type' => 'Birthday Cash Gift',
                'amount' => '1000',
                'description' => 'Cash gift on birthday for PWD members born in Q2',
                'status' => 'Active',
                'distributed' => 0,
                'pending' => 0,
                'submittedDate' => Carbon::now()->subMonths(1),
                'approvedDate' => Carbon::now()->subDays(20),
                'distributionDate' => Carbon::now()->subDays(30),
                'expiryDate' => Carbon::now()->addMonths(4),
                'quarter' => 'Q2',
                'birthdayMonth' => 'April',
                'barangay' => null,
                'color' => '#E74C3C',
            ],
            [
                'title' => 'Birthday Cash Gift - July to September',
                'type' => 'Birthday Cash Gift',
                'amount' => '1000',
                'description' => 'Cash gift on birthday for PWD members born in Q3',
                'status' => 'Active',
                'distributed' => 0,
                'pending' => 0,
                'submittedDate' => Carbon::now()->subDays(10),
                'approvedDate' => Carbon::now()->subDays(5),
                'distributionDate' => Carbon::now()->addDays(60),
                'expiryDate' => Carbon::now()->addMonths(7),
                'quarter' => 'Q3',
                'birthdayMonth' => 'July',
                'barangay' => null,
                'color' => '#E74C3C',
            ],
            [
                'title' => 'Birthday Cash Gift - October to December',
                'type' => 'Birthday Cash Gift',
                'amount' => '1000',
                'description' => 'Cash gift on birthday for PWD members born in Q4',
                'status' => 'Active',
                'distributed' => 0,
                'pending' => 0,
                'submittedDate' => Carbon::now()->subDays(5),
                'approvedDate' => Carbon::now()->subDays(2),
                'distributionDate' => Carbon::now()->addDays(90),
                'expiryDate' => Carbon::now()->addMonths(10),
                'quarter' => 'Q4',
                'birthdayMonth' => 'October',
                'barangay' => null,
                'color' => '#E74C3C',
            ],
        ];

        // Insert or get existing benefits
        $benefitIds = [];
        foreach ($benefits as $benefitData) {
            $existing = DB::table('benefit')
                ->where('type', $benefitData['type'])
                ->where('title', $benefitData['title'])
                ->first();
            
            if ($existing) {
                $benefitIds[] = $existing->id;
            } else {
                $benefitData['created_at'] = Carbon::now();
                $benefitData['updated_at'] = Carbon::now();
                $benefitId = DB::table('benefit')->insertGetId($benefitData);
                $benefitIds[] = $benefitId;
            }
        }

        echo "Created/Verified " . count($benefitIds) . " benefits.\n";

        // Generate benefit claims (about 50% of PWD members will have claims)
        // Use pwd_members table directly since that's where the data exists
        // Get valid userIDs from pwd_members table
        $validUserIDs = DB::table('pwd_members')
            ->whereNotNull('userID')
            ->pluck('userID')
            ->toArray();
        
        // Filter members to only those with valid userIDs
        $validMembers = $pwdMembers->filter(function($member) use ($validUserIDs) {
            return in_array($member->userID, $validUserIDs);
        });
        
        $claimCount = min((int)($validMembers->count() * 0.5), 500);
        $pwdMembersArrayForClaims = $validMembers->toArray();
        shuffle($pwdMembersArrayForClaims);
        $selectedMembersForClaims = array_slice($pwdMembersArrayForClaims, 0, $claimCount);
        
        echo "Found " . count($validUserIDs) . " valid userIDs in pwd_members table.\n";
        echo "Generating {$claimCount} benefit claims from " . $validMembers->count() . " valid members.\n";
        
        $benefitClaims = [];
        $claimStatuses = ['claimed' => 60, 'unclaimed' => 30, 'pending' => 10];
        $claimStatusDistribution = [];
        foreach ($claimStatuses as $status => $count) {
            for ($i = 0; $i < $count; $i++) {
                $claimStatusDistribution[] = $status;
            }
        }
        shuffle($claimStatusDistribution);

        foreach ($selectedMembersForClaims as $index => $member) {
            $memberObj = is_object($member) ? $member : (object)$member;
            // Randomly assign a benefit
            $benefitId = $benefitIds[array_rand($benefitIds)];
            $benefit = DB::table('benefit')->where('id', $benefitId)->first();
            
            $status = $claimStatusDistribution[$index % count($claimStatusDistribution)];
            $claimDate = Carbon::now()->subDays(rand(0, 90));

            $benefitClaims[] = [
                'pwdID' => $memberObj->userID, // References pwd_members.userID
                'benefitID' => $benefitId,
                'claimDate' => $claimDate->format('Y-m-d'),
                'status' => $status,
                'created_at' => $claimDate,
                'updated_at' => $claimDate,
            ];
        }

        // Insert benefit claims in batches
        // Note: The foreign key constraint references 'pwd_member' but the actual table is 'pwd_members'
        // We'll temporarily disable foreign key checks to work around this
        if (!empty($benefitClaims)) {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            
            $claimBatches = array_chunk($benefitClaims, $batchSize);
            foreach ($claimBatches as $batch) {
                DB::table('benefit_claim')->insert($batch);
            }
            
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            
            $insertedBenefitClaims = count($benefitClaims);
            echo "Generated {$insertedBenefitClaims} benefit claims.\n";
        } else {
            $insertedBenefitClaims = 0;
        }

        echo "\n=== SUMMARY ===\n";
        echo "Support Tickets Created: {$insertedSupportTickets}\n";
        echo "Benefits Created/Verified: " . count($benefitIds) . "\n";
        echo "Benefit Claims Created: " . (isset($insertedBenefitClaims) ? $insertedBenefitClaims : 0) . "\n";
    }
}

