# Generate 1000 Sample PWD Members and Applications

This seeder generates sample PWD (Persons with Disabilities) members and applications for testing and demonstration purposes. It also generates support tickets, benefits (ayuda), and benefit claims.

## Features

### PWD Members & Applications
- Generates users, PWD members, and applications
- Distributed across all 18 barangays in Cabuyao
- Includes all 13 disability types
- Realistic distribution of application statuses:
  - 60% Approved (creates PWD member records)
  - 15% Pending Admin Approval
  - 15% Pending Barangay Approval
  - 5% Under Review
  - 3% Needs Additional Documents
  - 2% Rejected
- Realistic Filipino names
- Random ages between 18-80 years old
- Applications distributed over the last 2 years

### Support Tickets
- Generates ~300 support tickets (30% of PWD members)
- Includes ticket messages (initial inquiry + admin replies)
- Status distribution:
  - 40% Open
  - 30% In Progress
  - 20% Resolved
  - 10% Closed
- Priority distribution:
  - 30% Low
  - 40% Medium
  - 25% High
  - 5% Urgent
- Various categories: General Inquiry, Technical Support, Application, Benefits, Account Issues, Documentation, Complaint

### Benefits (Ayuda)
- Creates 6 active benefits:
  - 2 Financial Assistance programs (Q1 & Q2 2025)
  - 4 Birthday Cash Gift programs (Q1, Q2, Q3, Q4)
- Distributed across all barangays
- Realistic dates and amounts

### Benefit Claims
- Generates ~500 benefit claims (50% of PWD members)
- Status distribution:
  - 60% Claimed
  - 30% Unclaimed
  - 10% Pending
- Links to actual benefits and PWD members

## Usage

### Method 1: Run via Artisan (Recommended)

```bash
cd pwd-backend
php artisan db:seed --class=Generate1000SamplePWDMembersSeeder
```

### Method 2: Set Count via Environment Variable

```bash
# Generate 500 records instead of 1000
SAMPLE_PWD_COUNT=500 php artisan db:seed --class=Generate1000SamplePWDMembersSeeder
```

### Method 3: Add to DatabaseSeeder

Edit `database/seeders/DatabaseSeeder.php` and add:

```php
$this->call([
    // ... other seeders
    Generate1000SamplePWDMembersSeeder::class,
]);
```

Then run:
```bash
php artisan db:seed
```

## Default Credentials

All generated users have:
- **Password**: `password123`
- **Role**: `PWDMember`
- **Status**: `active`

## Data Distribution

The seeder creates:
- **Users**: 1000 user accounts (or specified count)
- **PWD Members**: ~600 records (only for approved applications)
- **Applications**: 1000 applications with various statuses
- **Support Tickets**: ~300 tickets with messages
- **Benefits**: 6 active benefits (2 Financial Assistance + 4 Birthday Cash Gift)
- **Benefit Claims**: ~500 benefit claims

## Verification

After running the seeder, verify the data appears in:

1. **Admin Dashboard**: Check statistics cards, disability distribution chart, and support tickets count
2. **Barangay President Dashboard**: Check barangay-specific data and benefits
3. **PWD Records**: View all PWD members and applications
4. **Analytics**: View charts and statistics
5. **Reports**: Generate reports with the sample data
6. **Support Desk**: View support tickets and messages
7. **Ayuda/Benefits**: View benefits and benefit claims
8. **Benefit Tracking**: View benefit distribution and claims

## Notes

- The seeder processes data in batches of 100 for performance
- All emails are unique (format: `pwd{userID}_{timestamp}_{random}@sample.pwd.local`)
- Usernames are unique (format: `pwd_{userID}_{name}_{userID}`)
- PWD IDs are generated as `PWD-{6-digit-userID}`
- Reference numbers are generated as `REF-{year}-{6-digit-userID}`
- Support ticket numbers are generated as `SUP-{6-digit-ID}`
- Support tickets include initial messages from PWD members and admin replies for resolved/closed tickets
- Benefits are created once and reused if they already exist
- Benefit claims temporarily disable foreign key checks due to a migration issue (foreign key references `pwd_member` but table is `pwd_members`)

## Troubleshooting

If you encounter errors:

1. **Email uniqueness**: The seeder handles this automatically with unique identifiers
2. **Username uniqueness**: Each username includes the userID to ensure uniqueness
3. **Memory issues**: The seeder processes in batches to minimize memory usage
4. **Timeout**: For large datasets, consider increasing PHP's max_execution_time

## Cleanup

To remove all sample data:

```bash
# Remove sample users (be careful!)
php artisan tinker
>>> DB::table('users')->where('email', 'like', '%@sample.pwd.local')->delete();
>>> DB::table('pwd_members')->where('email', 'like', '%@sample.pwd.local')->delete();
>>> DB::table('application')->where('email', 'like', '%@sample.pwd.local')->delete();
>>> DB::table('support_tickets')->whereIn('pwd_member_id', DB::table('pwd_members')->where('email', 'like', '%@sample.pwd.local')->pluck('id'))->delete();
>>> DB::table('benefit_claim')->whereIn('pwdID', DB::table('pwd_members')->where('email', 'like', '%@sample.pwd.local')->pluck('userID'))->delete();
```

