<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PWDMember;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SamplePWDMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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

        $firstNames = [
            // Male names
            'Juan', 'Jose', 'Carlos', 'Antonio', 'Ricardo', 'Francisco', 'Manuel', 'Rodrigo',
            'Fernando', 'Roberto', 'Miguel', 'Eduardo', 'Alberto', 'Armando', 'Ramon',
            'Julio', 'Rafael', 'Daniel', 'Luis', 'Mario', 'Angel', 'Pablo', 'Victor',
            'Gabriel', 'Sebastian', 'Enrique', 'Pedro', 'Andres', 'Felipe', 'Hector',
            'Domingo', 'Arturo', 'Ernesto', 'Raul', 'Cesar', 'Sergio', 'Oscar', 'Leonardo',
            // Female names
            'Maria', 'Ana', 'Carmen', 'Rosa', 'Juana', 'Esperanza', 'Dolores', 'Rita',
            'Elena', 'Isabel', 'Teresa', 'Lucia', 'Patricia', 'Martha', 'Cecilia',
            'Angela', 'Rebecca', 'Monica', 'Sofia', 'Andrea', 'Laura', 'Gloria', 'Norma',
            'Sandra', 'Milagros', 'Rosario', 'Imelda', 'Lourdes', 'Concepcion', 'Felipa',
            'Remedios', 'Paz', 'Consuelo', 'Natividad', 'Fe', 'Merced', 'Perla', 'Adela'
        ];

        $lastNames = [
            'Dela Cruz', 'Garcia', 'Reyes', 'Ramos', 'Mendoza', 'Torres', 'Fernandez',
            'Villanueva', 'Gutierrez', 'Cruz', 'Lopez', 'Bautista', 'Santos', 'Morales',
            'Aquino', 'Rivera', 'Ocampo', 'Castro', 'Martinez', 'Gonzalez', 'Diaz',
            'Ramos', 'Salazar', 'Espinoza', 'Alvarez', 'Perez', 'Gomez', 'Medina',
            'Herrera', 'Vargas', 'Flores', 'Sanchez', 'Romero', 'Jimenez', 'Santiago',
            'Fernandez', 'Chavez', 'Ramos', 'Ortega', 'Moreno', 'Silva', 'Valdez',
            'Castillo', 'Aguilar', 'Mendoza', 'Navarro', 'Rojas', 'Pacheco', 'Vega',
            'Ramirez', 'Guerrero', 'Ruiz', 'Campos', 'Pineda', 'Escobar', 'Fuentes'
        ];

        $middleNames = [
            'Santos', 'Cruz', 'Reyes', 'Garcia', 'Lopez', 'Torres', 'Fernandez',
            'Mendoza', 'Ramos', 'Gonzalez', 'Diaz', 'Morales', 'Villanueva', 'Bautista',
            'Aquino', 'Rivera', 'Castro', 'Martinez', 'Salazar', 'Alvarez', 'Perez',
            'Medina', 'Herrera', 'Vargas', 'Sanchez', 'Romero', 'Jimenez', 'Santiago',
            'Chavez', 'Ortega', 'Moreno', 'Silva', 'Valdez', 'Castillo', 'Aguilar'
        ];

        $suffixes = ['', '', '', '', '', 'Jr.', 'Sr.', 'II', 'III']; // Most have no suffix

        $emergencyRelationships = ['Mother', 'Father', 'Husband', 'Wife', 'Sister', 'Brother', 
            'Son', 'Daughter', 'Cousin', 'Friend', 'Guardian'];

        $genders = ['Male', 'Female'];

        $statuses = ['Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Inactive']; // Mostly active

        $this->command->info('Generating 1000 sample PWD members...');
        $this->command->info('This may take a few minutes...');
        
        $progressBar = $this->command->getOutput()->createProgressBar(1000);
        $progressBar->start();

        for ($i = 1; $i <= 1000; $i++) {
            // Generate random data
            $gender = $genders[array_rand($genders)];
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $middleName = $middleNames[array_rand($middleNames)];
            $suffix = $suffixes[array_rand($suffixes)];
            $barangay = $barangays[array_rand($barangays)];
            $disabilityType = $disabilityTypes[array_rand($disabilityTypes)];
            $status = $statuses[array_rand($statuses)];

            // Generate birth date (age 18-80)
            $minAge = 18;
            $maxAge = 80;
            $birthYear = date('Y') - rand($minAge, $maxAge);
            $birthMonth = rand(1, 12);
            $birthDay = rand(1, 28); // Use 28 to avoid date issues
            $birthDate = Carbon::create($birthYear, $birthMonth, $birthDay)->format('Y-m-d');

            // Generate unique email
            $email = strtolower(
                str_replace(' ', '', 
                    $firstName . $middleName . $lastName . $i . '@pwd.com'
                )
            );

            // Generate phone number
            $contactNumber = '09' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT);

            // Generate address
            $streetNumber = rand(1, 999);
            $streetName = ['Main Street', 'Rizal Street', 'Bonifacio Street', 'Mabini Street',
                'Aguinaldo Street', 'Luna Street', 'Quezon Avenue', 'Santos Avenue',
                'Garcia Street', 'Reyes Street', 'Cruz Street', 'Torres Street'];
            $street = $streetName[array_rand($streetName)];
            $address = "{$streetNumber} {$street}, Barangay {$barangay}, Cabuyao City, Laguna";

            // Generate emergency contact
            $emergencyRelationship = $emergencyRelationships[array_rand($emergencyRelationships)];
            $emergencyFirstName = $firstNames[array_rand($firstNames)];
            $emergencyLastName = $lastNames[array_rand($lastNames)];
            $emergencyContact = "{$emergencyFirstName} {$emergencyLastName}";
            $emergencyPhone = '09' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT);

            // Generate username (unique)
            $username = strtolower(
                str_replace([' ', '-', "'"], '',
                    $firstName . $middleName . $lastName . $i
                )
            );

            // Create User
            try {
                $user = User::create([
                    'username' => $username,
                    'email' => $email,
                    'password' => Hash::make('password123'),
                    'role' => 'PWDMember',
                    'status' => 'active',
                    'password_change_required' => false
                ]);

                // Generate PWD ID
                $pwdId = 'PWD-' . str_pad($user->userID, 6, '0', STR_PAD_LEFT);

                // Create PWD Member
                PWDMember::create([
                    'userID' => $user->userID,
                    'pwd_id' => $pwdId,
                    'pwd_id_generated_at' => now(),
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                    'middleName' => $middleName,
                    'suffix' => $suffix,
                    'birthDate' => $birthDate,
                    'gender' => $gender,
                    'disabilityType' => $disabilityType,
                    'address' => $address,
                    'contactNumber' => $contactNumber,
                    'email' => $email,
                    'barangay' => $barangay,
                    'emergencyContact' => $emergencyContact,
                    'emergencyPhone' => $emergencyPhone,
                    'emergencyRelationship' => $emergencyRelationship,
                    'status' => $status
                ]);

                $progressBar->advance();
            } catch (\Exception $e) {
                // Skip duplicates or errors, continue with next
                $progressBar->advance();
                continue;
            }
        }

        $progressBar->finish();
        $this->command->newLine();
        $this->command->info('Successfully created 1000 sample PWD members!');
        $this->command->info('');
        $this->command->info('Default password for all sample accounts: password123');
        $this->command->info('');
        $this->command->info('Sample members are distributed across all 18 barangays with various disability types.');
    }
}

