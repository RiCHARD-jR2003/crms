# Complete Application Rejection Workflow

## What Happens When an Application is Rejected

### 1. Immediate Actions Taken by System

#### A. Status Update
- **Application status** changes from current status (e.g., `Pending Barangay Approval`, `Pending Admin Approval`, `For Assessment`) to **`Rejected`**
- **Rejection reason** and **remarks** are saved in the `remarks` field
- **Application is NOT deleted** - all data is retained for audit trail

#### B. Email Notification (Primary Method)
**Service**: `EmailService::sendApplicationRejectionEmail()`

**Email Details:**
- **Subject**: "PWD Application Status Update - Rejected"
- **From**: sarinonhoelivan29@gmail.com (Cabuyao PDAO RMS)
- **Delivery Method**: 
  1. Primary: SMTP (Gmail)
  2. Fallback: Gmail API (if SMTP fails)

**Email Content Includes:**
- Applicant's name (firstName + lastName)
- Application reference number
- Rejection reason (formatted)
- Detailed remarks/instructions
- Link to check application status
- Instructions for resubmission

**Email Template**: `resources/views/emails/application-rejected.blade.php`

**Important Note**: If email sending fails, the rejection still proceeds. Error is logged but doesn't prevent rejection.

#### C. In-App Notification
**Service**: `ApplicationObserver::handleStatusChange()`

**Notification Details:**
- **Type**: `application_status_change`
- **Title**: "Application Rejected"
- **Message**: Includes rejection reason and remarks
- **Recipient**: Applicant (if user account exists)
- **Action**: Links to application status page

**How It Works:**
1. `ApplicationObserver` detects status change to `Rejected`
2. Finds user by email or pwdID
3. Calls `NotificationService::notifyApplicationStatusChange()`
4. Creates notification record in database
5. Notification appears in applicant's notification panel

#### D. Admin Notifications
**Service**: `ApplicationObserver::handleStatusChange()`

**Notification Details:**
- **Type**: `application_status_change`
- **Title**: "Application Rejected"
- **Recipients**: All Admin and SuperAdmin users
- **Content**: 
  - Applicant name
  - Barangay
  - Application ID
  - Rejection reason
  - Who rejected it (if available)
  - Timestamp

**Purpose**: Keeps all admins informed about application rejections

---

## 2. Notification Methods Summary

| Method | Type | Timing | Recipient | Content |
|--------|------|--------|-----------|---------|
| **Email** | External | Immediate | Applicant | Rejection reason, remarks, reference number, resubmission instructions |
| **In-App** | Internal | Immediate | Applicant | Rejection notification with link to status page |
| **Admin Alert** | Internal | Immediate | All Admins | Application rejection summary |

---

## 3. Re-Application Policy

### Current Policy: **NO WAITING PERIOD - IMMEDIATE RESUBMISSION ALLOWED**

#### How Resubmission Works:

**Option A: Re-upload Documents (Recommended)**
- **Endpoint**: `POST /api/application-status/{referenceNumber}/reupload-documents`
- **Process**:
  1. Applicant uses reference number to access application status page
  2. Re-uploads corrected documents
  3. System automatically:
     - Updates application documents
     - Changes status from `Rejected` → `Pending Barangay Approval`
     - Clears rejection remarks
     - Updates submission date to current date
  4. Application goes back into review queue

**Option B: Submit New Application**
- **Endpoint**: `POST /api/applications`
- **Current Behavior**: 
  - When a new application is submitted, the system automatically **deletes all old rejected applications** for the same applicant (matched by email or contact number)
  - This prevents duplicate detection issues
  - Associated document files are also deleted from storage
  - The new application is created with status `Pending Barangay Approval`
- **Important**: This option replaces the old rejected application entirely. Use Option A if you want to preserve application history.

#### Key Points:
1. **No Cooldown Period**: Applicants can resubmit immediately after rejection
2. **No Maximum Attempts**: No limit on number of rejections/resubmissions
3. **Document Retention**: 
   - **Option A (Re-upload)**: All previously submitted documents are retained
   - **Option B (New Application)**: Old rejected applications and their documents are automatically deleted
4. **Status Reset**: 
   - **Option A**: When documents are re-uploaded, status resets to `Pending Barangay Approval`
   - **Option B**: New application is created with status `Pending Barangay Approval`

---

## 4. Complete Rejection Flow Diagram

```
Application Submitted
        ↓
[Pending Barangay Approval / Pending Admin Approval / For Assessment]
        ↓
Admin/Barangay President Reviews
        ↓
[REJECTION DECISION]
        ↓
┌─────────────────────────────────────┐
│  1. Status → "Rejected"             │
│  2. Remarks saved                   │
│  3. Email sent to applicant         │
│  4. In-app notification sent        │
│  5. Admin notifications sent        │
│  6. Application retained in DB      │
└─────────────────────────────────────┘
        ↓
Applicant Receives Notifications
        ↓
[Applicant Reviews Rejection Reason]
        ↓
┌─────────────────────────────────────┐
│  OPTION A: Re-upload Documents      │
│  - Use reference number              │
│  - Re-upload corrected docs          │
│  - Status → "Pending Barangay..."   │
│  - Back in review queue              │
└─────────────────────────────────────┘
        OR
┌─────────────────────────────────────┐
│  OPTION B: Submit New Application   │
│  - Create new application            │
│  - May be blocked if duplicate       │
│  - Recommended: Use Option A         │
└─────────────────────────────────────┘
```

---

## 5. Email Template Content

The rejection email includes:

1. **Header**: "⚠️ Application Status Update - PWD Application - Rejected"
2. **Reference Number**: Highlighted in blue box
3. **Rejection Reason**: Red box with formatted reason and remarks
4. **Important Information Box**: 
   - States data is retained
   - Explains they don't need to re-apply from scratch
   - Lists steps to resubmit:
     - Access status dashboard
     - Re-upload documents
     - Resubmit application
5. **Action Button**: "Check Application Status" (links to status page)
6. **Support Contact**: Email for questions
7. **Footer**: Automated message disclaimer

---

## 6. Technical Implementation Details

### Rejection Endpoint
```
POST /api/applications/{applicationID}/reject
```

**Request Body:**
```json
{
  "remarks": "Detailed rejection explanation",
  "rejectionReason": "incomplete_information|incorrect_information|document_resubmission|does_not_meet_criteria|other",
  "customReason": "Optional custom reason if rejectionReason is 'other'"
}
```

**Response:**
```json
{
  "message": "Application rejected successfully",
  "application": {
    "applicationID": "APP-000123",
    "status": "Rejected",
    "remarks": "Rejection Reason: ...\n\nRemarks:\n...",
    "referenceNumber": "REF-ABC12345"
  }
}
```

### Re-upload Endpoint
```
POST /api/application-status/{referenceNumber}/reupload-documents
```

**Request**: Multipart form data with document files

**Response:**
```json
{
  "success": true,
  "message": "Documents uploaded successfully. Your application has been resubmitted for review.",
  "application": {
    "status": "Pending Barangay Approval",
    "submissionDate": "2025-12-10 14:30:00"
  }
}
```

---

## 7. Notification Timing

- **Email**: Sent immediately via SMTP (synchronous)
- **In-App Notification**: Created immediately in database
- **Admin Notifications**: Created immediately for all admins
- **No Delays**: All notifications are sent synchronously upon rejection

---

## 8. Data Retention Policy

**Applications are NEVER deleted:**
- Rejected applications remain in database
- All documents are retained
- Assessment records retained (if assessment was completed)
- Rejection history is preserved
- Allows for:
  - Audit trail
  - Appeal process
  - Resubmission tracking
  - Historical analysis

---

## 9. Rejection Reasons and Their Impact

| Reason | Typical Action | Resubmission Ease |
|--------|---------------|-------------------|
| `incomplete_information` | Add missing information | Easy - just fill gaps |
| `incorrect_information` | Correct wrong data | Easy - update information |
| `document_resubmission` | Re-upload documents | Easy - replace documents |
| `does_not_meet_criteria` | May need new medical docs | Moderate - may need new assessment |
| `other` | Depends on custom reason | Varies |

---

## 10. Testing the Rejection Process

### Test Account Available:
- **Username**: `test_rejection_applicant`
- **Email**: `richardcarandangjr@gmail.com`
- **Password**: `Test123!@#`
- **Application Status**: `Pending Barangay Approval`
- **Application ID**: 1
- **Reference Number**: REF-8C2B36CA

### Test Steps:

1. **Test Rejection**:
   - Login as Barangay President (Banlic) or Admin
   - Go to PWD Records
   - Find "Richard Carandang" application
   - Reject with reason and remarks
   - Verify email sent to richardcarandangjr@gmail.com
   - Verify in-app notification (if user account exists)

2. **Test Resubmission**:
   - Use reference number REF-8C2B36CA
   - Access application status page
   - Re-upload documents
   - Verify status changes back to "Pending Barangay Approval"

---

## 11. Important Notes

1. **Email Delivery**: Uses SMTP (Gmail). If email fails, rejection still proceeds but error is logged.

2. **No Waiting Period**: Applicants can resubmit immediately after rejection. No cooldown period enforced.

3. **Multiple Rejections**: An applicant can be rejected multiple times. Each rejection is logged with timestamp.

4. **Resubmission Method**: Recommended method is re-uploading documents to existing application rather than creating new one.

5. **User Account Status**: 
   - If rejected at barangay level: User account may not exist yet
   - If rejected at admin level: User account likely exists
   - In-app notifications only work if user account exists

6. **Document Correction Requests**: Barangay Presidents can request specific document corrections before full rejection, which creates a document correction request instead of immediate rejection.

---

## 12. Future Enhancements (Not Currently Implemented)

- **Appeal Process**: Formal appeal workflow (currently requires resubmission)
- **Waiting Period Policy**: Configurable waiting period before resubmission
- **Rejection Analytics**: Track rejection reasons and patterns
- **Automated Reminders**: Remind applicants to resubmit after X days
- **Rejection Templates**: Pre-defined rejection reason templates

