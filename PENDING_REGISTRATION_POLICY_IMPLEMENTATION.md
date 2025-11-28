# Pending Registration Policy Implementation

## Overview
This document outlines the complete implementation of the Pending Registration Policy for the Comprehensive Record Management System (CRMS). The system automatically manages pending applications with configurable holding durations, expiry actions, and email notifications.

## Features Implemented

### 1. Database Schema
- **Migration**: `2025_01_15_000001_add_pending_registration_policy_to_application_table.php`
  - Added `expires_at` timestamp to `application` table
  - Added `reminder_sent` boolean flag
  - Changed `status` column from enum to string to support "Expired" status
  - Created `pending_registration_policy_settings` table with default values

### 2. Backend Components

#### Models
- **Application Model** (`app/Models/Application.php`)
  - Added `expires_at` and `reminder_sent` to fillable
  - Added `isExpired()`, `getRemainingTime()`, `calculateExpiryDate()`, `shouldSendReminder()` methods
  - Added `scopeExpired()` query scope

- **PendingRegistrationPolicySetting Model** (`app/Models/PendingRegistrationPolicySetting.php`)
  - Static methods: `getValue()`, `setValue()`, `getAllSettings()`

#### Controllers
- **PendingRegistrationPolicyController** (`app/Http/Controllers/API/PendingRegistrationPolicyController.php`)
  - `index()` - Get all settings
  - `show($key)` - Get specific setting
  - `update()` - Update settings (Admin only)

#### Commands
- **ProcessPendingApplications** (`app/Console/Commands/ProcessPendingApplications.php`)
  - Runs hourly via cron
  - Processes pending applications
  - Sends reminder emails
  - Auto-expires or auto-rejects based on settings
  - Sends notifications
  - Logs all actions to audit trail

#### Services
- **EmailService** (`app/Services/EmailService.php`)
  - `sendApplicationExpiryReminderEmail()` - Reminder before expiry
  - `sendApplicationExpiryEmail()` - Notification when expired
  - `sendApplicationExpiryRejectionEmail()` - Notification when auto-rejected
  - `sendApplicationExpiryAdminNotification()` - Admin notification

#### Email Templates
- `resources/views/emails/application-expiry-reminder.blade.php`
- `resources/views/emails/application-expired.blade.php`
- `resources/views/emails/application-expiry-rejected.blade.php`
- `resources/views/emails/application-expiry-admin-notification.blade.php`

### 3. Frontend Components

#### Components
- **PendingCountdown** (`src/components/application/PendingCountdown.js`)
  - Real-time countdown timer
  - Shows days, hours, minutes remaining
  - Urgent warning when < 24 hours
  - Expired state display

#### Updated Components
- **LandingPage** (`src/components/Landing/LandingPage.js`)
  - Integrated PendingCountdown component
  - Updated status colors to include "Expired"
  - Shows expiry information in status check

### 4. API Routes

#### Public Routes
- `GET /api/application-status/{referenceNumber}` - Updated to include expiry data

#### Protected Routes (Admin only)
- `GET /api/pending-registration-policy` - Get all settings
- `GET /api/pending-registration-policy/{key}` - Get specific setting
- `PUT /api/pending-registration-policy` - Update settings

### 5. Scheduled Tasks

#### Cron Job
- **Command**: `applications:process-pending`
- **Schedule**: Hourly (configured in `app/Console/Kernel.php`)
- **Actions**:
  - Checks all pending applications
  - Calculates expiry dates if missing
  - Sends reminder emails
  - Auto-expires or auto-rejects expired applications
  - Sends notifications
  - Logs to audit trail

## Configuration Settings

Default settings (stored in `pending_registration_policy_settings` table):

| Key | Default Value | Description |
|-----|--------------|-------------|
| `holding_duration_hours` | 72 | Hours before application expires (3 days) |
| `expiry_action` | `expire` | Action on expiry: `expire` or `reject` |
| `reminder_hours_before_expiry` | 24 | Hours before expiry to send reminder |
| `enable_pending_policy` | `true` | Enable/disable the policy |

## Usage

### Running Migrations
```bash
php artisan migrate
```

### Running Cron Job Manually
```bash
php artisan applications:process-pending
```

### Setting Up Cron (Production)
Add to crontab:
```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

### Updating Settings (Admin)
```javascript
// Frontend API call
await api.put('/pending-registration-policy', {
  holding_duration_hours: 48,
  expiry_action: 'reject',
  reminder_hours_before_expiry: 12,
  enable_pending_policy: true
});
```

## Email Notifications

### Applicant Emails
1. **Reminder Email** - Sent X hours before expiry (default: 24 hours)
2. **Expiry Email** - Sent when application expires (if action = "expire")
3. **Rejection Email** - Sent when application auto-rejected (if action = "reject")

### Admin Emails
- **Admin Notification** - Sent to all Admin/SuperAdmin users when application expires/rejects
- Includes: Reference number, applicant name, barangay, timestamps, action taken

## Audit Trail

All automated actions are logged to `audit_log` table with:
- `action`: `system.auto`
- `model`: `Application`
- `model_id`: Application ID
- `description`: Status change details
- `reference_number`: Application reference number
- `old_values`: Previous status
- `new_values`: New status and expiry info
- `user_agent`: "System Cron Job"

## Status Flow

```
Pending → (holding duration expires) → Expired/Rejected
         ↓
    (reminder sent)
```

## Integration Points

### Existing Modules
- **Document Requirements**: Maintained during expiry/rejection
- **Duplicate Detection**: Logged in audit trail when detected
- **ID Renewal**: Not affected by pending policy
- **Status Checking**: Enhanced with expiry information

### Status Check Feature
- Shows current status (Pending, Approved, Rejected, Expired, etc.)
- Displays submission timestamp
- Shows expiry timestamp
- Real-time countdown for pending applications
- Displays remarks/instructions

## Testing

### Manual Testing
1. Create a pending application
2. Set short holding duration (e.g., 1 hour) for testing
3. Run cron job: `php artisan applications:process-pending`
4. Verify emails sent
5. Check audit logs
6. Verify status changes

### Test Scenarios
- Application expires (action = "expire")
- Application auto-rejected (action = "reject")
- Reminder email sent before expiry
- Admin notification sent
- Status check shows countdown
- Expired applications display correctly

## Future Enhancements

Potential improvements:
1. Extend expiry date manually (admin)
2. Bulk expiry/rejection actions
3. Custom reminder schedules
4. SMS notifications
5. Dashboard widget for pending countdown
6. Analytics on expiry rates

## Notes

- All emails use the same reference number format
- Duplicate detection rules are maintained
- Audit trail includes all required information
- UI follows CRMS standard design
- Cron job matches existing scheduling patterns

