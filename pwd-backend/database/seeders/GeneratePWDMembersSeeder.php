<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\User;
use App\Models\PWDMember;
use App\Models\Application;
use App\Models\Benefit;
use App\Models\BenefitClaim;
use App\Models\SupportTicket;

class GeneratePWDMembersSeeder extends Seeder
{
    // All 18 Barangays in Cabuyao
    private $barangays = [
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

    // Disability types from application form
    private $disabilityTypes = [
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

    // Application statuses
    private $applicationStatuses = [
        'Pending',
        'Approved',
        'Pending Barangay Approval',
        'Pending Admin Approval',
        'Under Review'
    ];

    // First names for data
    private $firstNames = [
        'Maria', 'Juan', 'Anna', 'Jose', 'Carlos', 'Rosa', 'Pedro',
        'Carmen', 'Antonio', 'Isabel', 'Francisco', 'Lucia', 'Manuel', 'Elena',
        'Miguel', 'Teresa', 'Ramon', 'Ana', 'Rafael', 'Esperanza', 'Fernando',
        'Concepcion', 'Ricardo', 'Dolores', 'Enrique', 'Patricia', 'Roberto',
        'Mercedes', 'Eduardo', 'Alberto', 'Marina', 'Jorge', 'Blanca',
        'Daniel', 'Gloria', 'Marcos', 'Soledad', 'Alfredo', 'Amparo',
        'Cristina', 'Luis', 'Carmela', 'Rodrigo', 'Victoria', 'Emilio',
        'Beatriz', 'Felipe', 'Gabriela', 'Sergio', 'Diana', 'Raul',
        'Monica', 'Oscar', 'Adriana', 'Manuel', 'Sofia', 'Hector',
        'Irene', 'Leonardo', 'Carolina', 'Arturo', 'Elena', 'Julio',
        'Lourdes', 'Angel', 'Margarita', 'Cesar', 'Isabella', 'Andres',
        'Bernadette', 'Ruben', 'Carmina', 'Joaquin', 'Roxanne', 'Gerardo',
        'Claudia', 'Ernesto', 'Natalia', 'Diego', 'Adela', 'Esteban',
        'Rosalinda', 'Gregorio', 'Consuelo', 'Hernando', 'Felicia', 'Lorenzo',
        'Selena', 'Vincente', 'Giselle', 'Fernando', 'Valeria', 'Mauricio',
        'Regina', 'Octavio', 'Leticia', 'Sebastian', 'Yolanda', 'Renato'
    ];

    // Last names for data
    private $lastNames = [
        'Santos', 'Garcia', 'Reyes', 'Cruz', 'Bautista', 'Villanueva', 'Fernandez',
        'Ramos', 'Torres', 'Mendoza', 'Lopez', 'Dela Cruz', 'Rivera', 'Gonzalez',
        'Castillo', 'Espiritu', 'Morales', 'Aquino', 'Alvarez', 'Castro', 'Romero',
        'Santiago', 'Marquez', 'Perez', 'Navarro', 'Martinez', 'Rodriguez',
        'Sanchez', 'Ortega', 'Gutierrez', 'Jimenez', 'Villanueva', 'De Leon',
        'Salazar', 'Villar', 'Montejo', 'Ledesma', 'Carpio', 'Valdez',
        'Estrada', 'Coronel', 'Molina', 'Aguilar', 'Buenaventura', 'Espinosa',
        'Mariano', 'Padilla', 'Ramos', 'Cordero', 'Galvez', 'Herrera',
        'Medina', 'Ocampo', 'Quinones', 'Rubio', 'Solis', 'Tolentino',
        'Urbano', 'Vega', 'Zapata', 'Acosta', 'Beltran', 'Cordova',
        'Duran', 'Escobar', 'Fuentes', 'Guzman', 'Hernandez', 'Ibarra',
        'Juarez', 'Kramer', 'Luna', 'Morales', 'Nunez', 'Oliva',
        'Pena', 'Quiroz', 'Rosario', 'Silva', 'Tovar', 'Uy',
        'Vargas', 'Warren', 'Xavier', 'Ybanez', 'Zambrano'
    ];

    // Middle names for data
    private $middleNames = [
        'Reyes', 'Cruz', 'Santos', 'Garcia', 'Lopez', 'Torres', 'Fernandez',
        'Ramos', 'Bautista', 'Villanueva', 'Mendoza', 'Dela Cruz', 'Rivera',
        null, null, null, null, null // Some without middle names
    ];

    /**
     * Run the database seeds.
     */
    public function run()
    {
        $this->command->info('Starting to generate 1000 PWD members/applicants...');

        // Get or create base benefits
        $financialAssistance = Benefit::firstOrCreate(
            ['type' => 'Financial Assistance'],
            [
                'title' => 'Financial Assistance Program',
                'amount' => '5000',
                'description' => 'Quarterly financial assistance for PWD members',
                'status' => 'Active',
                'distributed' => 0,
                'pending' => 0,
                'submittedDate' => Carbon::now()->subMonths(6),
                'approvedDate' => Carbon::now()->subMonths(5)
            ]
        );

        $birthdayGift = Benefit::firstOrCreate(
            ['type' => 'Birthday Cash Gift'],
            [
                'title' => 'Birthday Cash Gift',
                'amount' => '1000',
                'description' => 'Cash gift on birthday for PWD members',
                'status' => 'Active',
                'distributed' => 0,
                'pending' => 0,
                'submittedDate' => Carbon::now()->subMonths(6),
                'approvedDate' => Carbon::now()->subMonths(5)
            ]
        );

        $benefitIds = [$financialAssistance->id, $birthdayGift->id];

        // Generate dates over the past 6 months
        $startDate = Carbon::now()->subMonths(6);
        $endDate = Carbon::now();

        $progressInterval = 100;
        
        for ($i = 0; $i < 1000; $i++) {
            // Generate random date within the past 6 months
            $randomDays = rand(0, 180);
            $createdAt = $startDate->copy()->addDays($randomDays);
            
            // Create user
            $username = 'pwd_member_' . ($i + 1) . '_' . Str::random(6);
            $email = 'pwd' . ($i + 1) . '_' . Str::random(4) . '@example.com';
            
            $user = User::create([
                'username' => $username,
                'email' => $email,
                'password' => bcrypt('password123'),
                'role' => 'PWDMember',
                'status' => 'active',
                'password_change_required' => false,
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ]);

            // Generate member data
            $firstName = $this->firstNames[array_rand($this->firstNames)];
            $lastName = $this->lastNames[array_rand($this->lastNames)];
            $middleName = rand(0, 10) < 7 ? $this->middleNames[array_rand($this->middleNames)] : null;
            $suffix = rand(0, 20) < 2 ? ['Jr.', 'Sr.', 'II', 'III'][array_rand(['Jr.', 'Sr.', 'II', 'III'])] : null;
            
            $birthDate = Carbon::now()->subYears(rand(18, 80));
            $gender = ['Male', 'Female', 'Other'][array_rand(['Male', 'Female', 'Other'])];
            $disabilityType = $this->disabilityTypes[array_rand($this->disabilityTypes)];
            $barangay = $this->barangays[array_rand($this->barangays)];
            
            // Generate address
            $streetNumber = rand(1, 999);
            $streetName = ['Rizal Street', 'Mabini Avenue', 'Luna Street', 'Burgos Road', 'Bonifacio Street'][array_rand(['Rizal Street', 'Mabini Avenue', 'Luna Street', 'Burgos Road', 'Bonifacio Street'])];
            $address = "$streetNumber $streetName, $barangay, Cabuyao City, Laguna";
            
            // Generate contact info
            $contactNumber = '09' . rand(100000000, 999999999);
            $emailMember = $email;
            
            // Some members have PWD card numbers (80% have cards)
            $hasCard = rand(0, 10) < 8;
            $pwdId = null;
            if ($hasCard) {
                do {
                    $pwdIdCandidate = 'PWD-' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
                    $exists = PWDMember::where('pwd_id', $pwdIdCandidate)->exists();
                } while ($exists);
                $pwdId = $pwdIdCandidate;
            }
            $pwdIdGeneratedAt = $hasCard ? $createdAt->copy()->addDays(rand(1, 30)) : null;

            // Create PWD Member
            $member = PWDMember::create([
                'userID' => $user->userID,
                'pwd_id' => $pwdId,
                'pwd_id_generated_at' => $pwdIdGeneratedAt,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'middleName' => $middleName,
                'suffix' => $suffix,
                'birthDate' => $birthDate->format('Y-m-d'),
                'gender' => $gender,
                'disabilityType' => $disabilityType,
                'address' => $address,
                'contactNumber' => $contactNumber,
                'email' => $emailMember,
                'barangay' => $barangay,
                'emergencyContact' => $firstName . ' ' . $lastName,
                'emergencyPhone' => '09' . rand(100000000, 999999999),
                'emergencyRelationship' => ['Spouse', 'Parent', 'Sibling', 'Child'][array_rand(['Spouse', 'Parent', 'Sibling', 'Child'])],
                'status' => ['Active', 'Active', 'Active', 'Inactive'][array_rand(['Active', 'Active', 'Active', 'Inactive'])],
                'created_at' => $createdAt,
                'updated_at' => $createdAt
            ]);

            // Create application (90% have applications)
            if (rand(0, 10) < 9) {
                $appStatus = $this->applicationStatuses[array_rand($this->applicationStatuses)];
                $appDate = $createdAt->copy()->subDays(rand(0, 90));
                $referenceNumber = 'REF-' . strtoupper(Str::random(8));
                
                Application::create([
                    'referenceNumber' => $referenceNumber,
                    'pwdID' => $user->userID,
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                    'middleName' => $middleName,
                    'suffix' => $suffix,
                    'birthDate' => $birthDate->format('Y-m-d'),
                    'gender' => $gender,
                    'civilStatus' => ['Single', 'Married', 'Widowed', 'Divorced'][array_rand(['Single', 'Married', 'Widowed', 'Divorced'])],
                    'nationality' => 'Filipino',
                    'disabilityType' => $disabilityType,
                    'disabilityCause' => ['Congenital', 'Accident', 'Illness', 'Other'][array_rand(['Congenital', 'Accident', 'Illness', 'Other'])],
                    'disabilityDate' => $birthDate->copy()->addYears(rand(0, 60))->format('Y-m-d'),
                    'address' => $address,
                    'barangay' => $barangay,
                    'city' => 'Cabuyao',
                    'province' => 'Laguna',
                    'postalCode' => '4025',
                    'email' => $emailMember,
                    'contactNumber' => $contactNumber,
                    'emergencyContact' => $firstName . ' ' . $lastName,
                    'emergencyPhone' => '09' . rand(100000000, 999999999),
                    'emergencyRelationship' => ['Spouse', 'Parent', 'Sibling'][array_rand(['Spouse', 'Parent', 'Sibling'])],
                    'idType' => ['Driver\'s License', 'Passport', 'National ID'][array_rand(['Driver\'s License', 'Passport', 'National ID'])],
                    'idNumber' => strtoupper(Str::random(10)),
                    'submissionDate' => $appDate->format('Y-m-d'),
                    'status' => $appStatus,
                    'created_at' => $appDate,
                    'updated_at' => $appDate
                ]);
            }

            // Create benefit claims (50% of members have claimed benefits)
            if (rand(0, 10) < 5) {
                try {
                    $benefitId = $benefitIds[array_rand($benefitIds)];
                    $claimDate = $createdAt->copy()->addDays(rand(1, 120));
                    $claimStatus = ['approved', 'pending', 'approved'][array_rand(['approved', 'pending', 'approved'])]; // Mostly approved
                    
                    BenefitClaim::create([
                        'pwdID' => $user->userID,
                        'benefitID' => $benefitId,
                        'claimDate' => $claimDate->format('Y-m-d'),
                        'status' => $claimStatus,
                        'created_at' => $claimDate,
                        'updated_at' => $claimDate
                    ]);
                } catch (\Exception $e) {
                    // Skip if constraint fails
                }
            }

            // Create support tickets (20% of members have support tickets)
            if (rand(0, 10) < 2) {
                try {
                    $ticketStatuses = ['open', 'in_progress', 'resolved', 'closed'];
                    $ticketStatus = $ticketStatuses[array_rand($ticketStatuses)];
                    $ticketDate = $createdAt->copy()->addDays(rand(1, 150));
                    $ticketNumber = 'TKT-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT);
                    
                    $subjects = [
                        'PWD Card Application Status',
                        'Benefit Claim Inquiry',
                        'Document Verification',
                        'Account Access Issue',
                        'Card Renewal Request',
                        'General Inquiry',
                        'Technical Support',
                        'Application Help'
                    ];
                    
                    $descriptions = [
                        'I would like to inquire about my PWD card application status.',
                        'I need help with my benefit claim submission.',
                        'I need to verify some documents for my application.',
                        'I am having trouble accessing my account.',
                        'I need to renew my PWD card.',
                        'I have a general question about the PWD services.',
                        'I need technical support for the system.',
                        'I need help with the application process.'
                    ];
                    
                    $categories = ['PWD Card', 'Benefits', 'Technical', 'General'];
                    
                    // Get member ID (for support tickets table)
                    $memberId = DB::table('pwd_members')->where('userID', $user->userID)->value('id');
                    
                    if ($memberId) {
                        $resolvedAt = in_array($ticketStatus, ['resolved', 'closed']) 
                            ? $ticketDate->copy()->addDays(rand(1, 30)) 
                            : null;
                        $closedAt = $ticketStatus === 'closed' 
                            ? $ticketDate->copy()->addDays(rand(1, 45)) 
                            : null;
                        
                        SupportTicket::create([
                            'ticket_number' => $ticketNumber,
                            'subject' => $subjects[array_rand($subjects)],
                            'description' => $descriptions[array_rand($descriptions)],
                            'pwd_member_id' => $memberId,
                            'status' => $ticketStatus,
                            'priority' => ['low', 'medium', 'high', 'urgent'][array_rand(['low', 'medium', 'high', 'urgent'])],
                            'category' => $categories[array_rand($categories)],
                            'resolved_at' => $resolvedAt,
                            'closed_at' => $closedAt,
                            'created_at' => $ticketDate,
                            'updated_at' => $ticketDate
                        ]);
                    }
                } catch (\Exception $e) {
                    // Skip if constraint fails
                }
            }

            // Progress indicator
            if (($i + 1) % $progressInterval == 0) {
                $this->command->info("Generated " . ($i + 1) . " PWD members...");
            }
        }

        // Update benefit distributed counts
        $financialAssistance->update([
            'distributed' => BenefitClaim::where('benefitID', $financialAssistance->id)->count()
        ]);
        
        $birthdayGift->update([
            'distributed' => BenefitClaim::where('benefitID', $birthdayGift->id)->count()
        ]);

        $this->command->info('');
        $this->command->info('Successfully generated 1000 PWD members/applicants!');
        $this->command->info('');
        $this->command->info('Summary:');
        $this->command->info('- PWD Members: ' . PWDMember::count());
        $this->command->info('- Applications: ' . Application::count());
        $this->command->info('- Benefit Claims: ' . BenefitClaim::count());
        $this->command->info('- Support Tickets: ' . SupportTicket::count());
        $this->command->info('- Total PWD Member Users: ' . User::where('role', 'PWDMember')->count());
    }
}

