# Sample PWD Member Data Seeder

This seeder generates 1000 sample PWD (Persons with Disabilities) members with realistic Filipino data for testing and development purposes.

## Features

- **1000 Sample Members**: Generates 1000 unique PWD member records
- **Realistic Data**: Includes Filipino names, addresses, phone numbers, and more
- **Diverse Distribution**: 
  - Members distributed across all 18 barangays in Cabuyao
  - 13 different disability types
  - Ages ranging from 18 to 80 years old
  - Mix of male and female members
  - Mostly active members with some inactive

## Data Generated

Each sample member includes:
- User account (username, email, password)
- PWD Member record with full details
- Unique PWD ID (format: PWD-000001, PWD-000002, etc.)
- Personal information (name, birth date, gender, disability type)
- Contact information (phone, email, address)
- Emergency contact information
- Barangay assignment
- Status (mostly Active, some Inactive)

## Usage

### Option 1: Run the seeder independently

```bash
cd pwd-backend
php artisan db:seed --class=SamplePWDMemberSeeder
```

### Option 2: Enable it in DatabaseSeeder

Edit `database/seeders/DatabaseSeeder.php` and uncomment the last line:

```php
// Uncomment the line below to generate 1000 sample PWD members
$this->call([SamplePWDMemberSeeder::class]);
```

Then run:

```bash
php artisan db:seed
```

## Default Credentials

All sample PWD member accounts use:
- **Password**: `password123`
- **Username**: Generated based on name (e.g., `juansantosdelacruz1`)
- **Email**: Generated format (e.g., `juansantosdelacruz1@pwd.com`)

## Notes

- The seeder includes a progress bar to show generation progress
- Duplicate entries are automatically skipped
- Generation may take a few minutes for 1000 records
- All dates are randomly generated within valid ranges
- Phone numbers follow Philippine mobile format (09XXXXXXXXX)

## Statistics

The seeder generates members with:
- **18 Barangays**: Evenly distributed across all barangays
- **13 Disability Types**: Randomly assigned from all available types
- **Age Range**: 18-80 years old
- **Gender**: Random distribution
- **Status**: ~87% Active, ~13% Inactive

## Example Generated Data

```
Name: Juan Santos Dela Cruz
Email: juansantosdelacruz1@pwd.com
PWD ID: PWD-000001
Barangay: Baclaran
Disability: Visual Impairment
Status: Active
Birth Date: 1985-03-15
Phone: 09123456789
```

