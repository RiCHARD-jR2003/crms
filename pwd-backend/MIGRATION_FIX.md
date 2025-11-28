# Migration Fix Instructions

## Issue
The migration is failing due to a Doctrine DBAL compatibility issue. However, the code has been updated to handle the missing table gracefully.

## Current Status
✅ **The application should work now** - The code has been updated to handle missing `pending_registration_policy_settings` table gracefully. The status check will use default values (72 hours holding duration) if the table doesn't exist.

## Solutions

### Option 1: Run Manual SQL (Recommended)
Execute the SQL script manually:

```bash
mysql -u your_username -p your_database < database/manual_create_pending_policy_table.sql
```

Or run it through phpMyAdmin or your database client.

### Option 2: Fix Doctrine DBAL Issue
The error is due to a version mismatch between Laravel and Doctrine DBAL. Try:

```bash
composer require doctrine/dbal:^3.0
```

Then run:
```bash
php artisan migrate
```

### Option 3: Skip Problematic Migration
If you want to skip the file_storage migration and only run the pending policy migration:

```bash
php artisan migrate --path=database/migrations/2025_01_15_000001_add_pending_registration_policy_to_application_table.php
```

## Verification
After creating the table, verify it exists:

```sql
SHOW TABLES LIKE 'pending_registration_policy_settings';
SELECT * FROM pending_registration_policy_settings;
```

## Default Settings
The table will be created with these default values:
- `holding_duration_hours`: 72 (3 days)
- `expiry_action`: expire
- `reminder_hours_before_expiry`: 24
- `enable_pending_policy`: true

## Note
The application will continue to work with default values even if the table doesn't exist, but you won't be able to configure the settings through the admin panel until the table is created.

