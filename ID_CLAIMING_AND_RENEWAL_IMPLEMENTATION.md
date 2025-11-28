# ID Claiming and Renewal Implementation Summary

## Overview
This document summarizes the implementation of automated notifications for ID claiming and renewal reminders in the CRMS system.

## Backend Implementation

### 1. Database Migrations
- **`2025_01_20_000001_add_renewal_flagging_to_pwd_members.php`**: Adds `renewal_flag`, `flagged_at`, and `renewal_reminder_sent_at` fields to `pwd_members` table
- **`2025_01_20_000002_add_renewal_settings_table.php`**: Creates `renewal_settings` table with configurable renewal parameters

### 2. Models
- **`RenewalSetting.php`**: Model for managing renewal settings (days before expiry, reminder interval)
- **`PWDMember.php`**: Updated with renewal-related methods:
  - `isFlaggedForRenewal()`
  - `needsRenewal($daysBeforeExpiry)`
  - `flagForRenewal()`
  - `unflagFromRenewal()`
  - `markRenewalReminderSent()`
  - `shouldSendRenewalReminder($reminderIntervalDays)`
  - Scopes: `flaggedForRenewal()`, `readyToClaim()`

### 3. Email Service
- **`EmailService.php`**: Added three new methods:
  - `sendIDClaimingEmail($data)`: Sends email when ID is ready for claiming
  - `sendIDRenewalReminderEmail($data)`: Sends renewal reminder emails
  - `sendIDClaimingAdminNotification($data)`: Notifies admins about new IDs ready for claiming

### 4. Email Templates
- **`id-claiming.blade.php`**: Email template for ID claiming notification
- **`id-renewal-reminder.blade.php`**: Email template for renewal reminders
- **`id-claiming-admin-notification.blade.php`**: Email template for admin notifications

### 5. Cron Job Command
- **`CheckCardRenewals.php`**: Enhanced command that:
  - Flags members for renewal based on configurable days before expiry
  - Sends renewal reminder emails at configurable intervals
  - Creates notifications for members
  - Unflags members whose cards have expired or are past threshold
  - Runs daily (scheduled in `Kernel.php`)

### 6. Application Observer
- **`ApplicationObserver.php`**: Observes Application model changes
  - Automatically sends claiming email when status changes to "For Claiming"
  - Sends admin notification when ID is ready for claiming
  - Registered in `AppServiceProvider.php`

### 7. API Controller
- **`RenewalController.php`**: Provides endpoints for:
  - `GET /api/renewals/members`: Get all members flagged for renewal (with sorting and filtering)
  - `GET /api/renewals/stats`: Get renewal statistics
  - `GET /api/renewals/settings`: Get renewal settings
  - `POST /api/renewals/settings`: Update renewal settings

### 8. Routes
- Added renewal management routes in `api.php`:
  ```php
  Route::prefix('renewals')->group(function () {
      Route::get('/members', [RenewalController::class, 'getRenewalMembers']);
      Route::get('/stats', [RenewalController::class, 'getRenewalStats']);
      Route::get('/settings', [RenewalController::class, 'getRenewalSettings']);
      Route::post('/settings', [RenewalController::class, 'updateRenewalSettings']);
  });
  ```

## Frontend Implementation (Pending)

### 1. Status Badges
- Update `getStatusColor()` functions in:
  - `LandingPage.js`
  - `PWDRecords.js`
  - `BarangayPresidentPWDRecords.js`
  - `BarangayPresidentDashboard.js`
- Add colors for:
  - "For Claiming": `#3498DB` (Blue)
  - "For Renewal": `#E74C3C` (Red)

### 2. Renewal Dashboard Component
- Create `RenewalDashboard.js` component
- Display:
  - Statistics cards (total flagged, expiring this week/month, reminders sent)
  - Table of flagged members with sorting/filtering
  - Settings panel for configurable renewal parameters

### 3. Claiming Notification Banner
- Add banner in applicant portal/status check page
- Display when application status is "For Claiming"
- Show claiming instructions and schedule

## Configuration

### Default Settings
- **Renewal Days Before Expiry**: 30 days (configurable)
- **Renewal Reminder Interval**: 7 days (configurable)

### Cron Schedule
- **Renewal Check**: Daily at 9:00 AM (`pwd:check-card-renewals`)

## Important Notes

1. **Reference Number**: As per requirements, reference numbers are NOT used for ID claiming or renewal workflows. They remain only for application status checking.

2. **Integration**: The system integrates with:
   - Announcement system
   - Duplicate-entry logic
   - Pending registration expiration policies
   - Email and notification system

3. **Email Format**: All emails follow CRMS standard format with:
   - Professional styling
   - Clear instructions
   - Contact information
   - Office address and schedule

## Testing Checklist

- [ ] Run migrations: `php artisan migrate`
- [ ] Test application status change to "For Claiming" triggers email
- [ ] Test renewal flagging with cron job: `php artisan pwd:check-card-renewals`
- [ ] Verify email templates render correctly
- [ ] Test renewal dashboard API endpoints
- [ ] Verify status badges display correctly in frontend
- [ ] Test claiming notification banner in applicant portal

## Next Steps

1. Complete frontend components (renewal dashboard, status badges, claiming banner)
2. Add unit tests for renewal logic
3. Add integration tests for email sending
4. Update documentation with user guides

