# Application Rejection Process Documentation

## Overview
This document explains the complete rejection process for PWD applications at different levels: Barangay Level, Admin Level, and Assessment Level.

---

## 1. Barangay Level Rejection

### When It Happens
- Application status: `Pending Barangay Approval`
- Rejected by: Barangay President
- Location: Barangay President Dashboard → PWD Records

### Process Flow

1. **Barangay President Reviews Application**
   - Views application details in Barangay President PWD Records page
   - Reviews submitted documents and information
   - Can request document corrections before rejection

2. **Rejection Options**
   - **Standard Rejection**: Direct rejection with reason
   - **Document Correction Request**: Request specific documents to be resubmitted before rejection

3. **Rejection Form Fields**
   - **Rejection Reason** (Required):
     - `incomplete_information` - Incomplete Information
     - `incorrect_information` - Incorrect Information
     - `document_resubmission` - Document Resubmission/Correction Required
     - `does_not_meet_criteria` - Does Not Meet Criteria
     - `other` - Other (requires custom reason)
   - **Custom Reason** (Required if "Other" selected)
   - **Remarks** (Required) - Detailed explanation

4. **What Happens After Rejection**
   - Application status changes to: `Rejected`
   - Rejection reason and remarks are saved in `remarks` field
   - **Email notification** sent to applicant with:
     - Rejection reason
     - Detailed remarks
     - Instructions for resubmission (if applicable)
   - **In-app notification** sent to applicant
   - Application remains in database (not deleted)
   - Applicant can re-upload documents and resubmit

5. **API Endpoint**
   ```
   POST /api/applications/{applicationID}/reject
   ```
   **Request Body:**
   ```json
   {
     "remarks": "Detailed rejection remarks",
     "rejectionReason": "incomplete_information",
     "customReason": "Optional custom reason if rejectionReason is 'other'"
   }
   ```

---

## 2. Admin Level Rejection

### When It Happens
- Application status: `Pending Admin Approval`
- Rejected by: Admin or SuperAdmin
- Location: Admin Dashboard → PWD Records

### Process Flow

1. **Admin Reviews Application**
   - Views application in PWD Records page
   - Application has already been approved by Barangay President
   - May have completed disability assessment (if required)
   - Reviews all documents and assessment results

2. **Rejection Process**
   - Admin clicks "Reject" button
   - Provides rejection reason/remarks
   - Confirms rejection

3. **What Happens After Rejection**
   - Application status changes to: `Rejected`
   - Rejection remarks saved in `remarks` field
   - **Email notification** sent to applicant with:
     - Rejection reason
     - Detailed remarks
     - Instructions for appeal or resubmission
   - **In-app notification** sent to applicant
   - **Notification sent to other admins** about the rejection
   - Application remains in database (not deleted)
   - Applicant can resubmit with corrections

4. **API Endpoint**
   ```
   POST /api/applications/{applicationID}/reject
   ```
   **Request Body:**
   ```json
   {
     "remarks": "Detailed rejection remarks",
     "rejectionReason": "does_not_meet_criteria",
     "customReason": "Optional custom reason"
   }
   ```

---

## 3. Assessment Level Rejection

### When It Happens
- Application status: `For Assessment` or `Pending Admin Approval` (after assessment)
- Rejected by: Admin or SuperAdmin
- Location: Admin Dashboard → PWD Records or Disability Assessment page

### Process Flow

1. **Assessment Status Scenarios**
   - **Scenario A**: Application approved by barangay, assessment scheduled but not completed
     - Status: `For Assessment`
     - Assessment Status: `pending` or `scheduled`
   - **Scenario B**: Assessment completed but results don't meet criteria
     - Status: `Pending Admin Approval`
     - Assessment Status: `completed` or `finalized`
     - Assessment PDF may be uploaded

2. **Rejection Process**
   - Admin reviews assessment results
   - Determines applicant doesn't meet disability criteria
   - Rejects application with assessment-specific reason

3. **Rejection Reasons (Assessment-Specific)**
   - `does_not_meet_criteria` - Disability assessment doesn't meet PWD criteria
   - `incomplete_assessment` - Assessment incomplete or invalid
   - `medical_documentation_insufficient` - Medical documentation insufficient
   - `other` - Other assessment-related reason

4. **What Happens After Rejection**
   - Application status changes to: `Rejected`
   - Assessment status may remain as `completed` or `finalized` (for record keeping)
   - Rejection remarks saved in `remarks` field
   - **Email notification** sent to applicant with:
     - Assessment-based rejection reason
     - Detailed remarks
     - Information about appeal process (if applicable)
   - **In-app notification** sent to applicant
   - **Notification sent to other admins** about the rejection
   - Application and assessment records remain in database
   - Applicant can resubmit with new medical documentation

5. **API Endpoint**
   ```
   POST /api/applications/{applicationID}/reject
   ```
   **Request Body:**
   ```json
   {
     "remarks": "Assessment results indicate applicant does not meet PWD criteria. Medical documentation shows temporary condition, not permanent disability.",
     "rejectionReason": "does_not_meet_criteria",
     "customReason": null
   }
   ```

---

## Common Rejection Features Across All Levels

### 1. Email Notifications
All rejections trigger email notifications to the applicant containing:
- Application reference number
- Rejection reason
- Detailed remarks
- Instructions for resubmission or appeal

### 2. In-App Notifications
- Applicant receives notification in their notification panel
- Notification links to application status page
- Shows rejection reason and remarks

### 3. Data Retention
- **Applications are NEVER deleted** - they remain in database with `Rejected` status
- All documents are retained
- Assessment records are retained (if assessment was completed)
- This allows for:
  - Audit trail
  - Appeal process
  - Resubmission tracking
  - Historical records

### 4. Resubmission Process
After rejection, applicants can:
- View rejection reason and remarks
- Re-upload corrected documents
- Resubmit application (creates new application or updates existing)
- Track resubmission history

### 5. Notification to Other Admins
When an admin rejects an application:
- Other admins receive notification
- Notification includes:
  - Applicant name
  - Barangay
  - Application ID
  - Rejection reason
  - Who rejected it

---

## Rejection Reason Codes

| Code | Description | Use Case |
|------|-------------|----------|
| `incomplete_information` | Missing required information | Missing personal details, incomplete forms |
| `incorrect_information` | Wrong or inaccurate information | Mismatched IDs, incorrect dates, false information |
| `document_resubmission` | Documents need correction | Blurry photos, expired certificates, wrong documents |
| `does_not_meet_criteria` | Doesn't meet PWD eligibility | Assessment shows no disability, temporary condition |
| `other` | Custom reason | Any other reason not covered above |

---

## Testing the Rejection Process

### Test Account Created
- **Username**: `test_rejection_applicant`
- **Email**: `richardcarandangjr@gmail.com`
- **Password**: `Test123!@#`
- **Application Status**: `Pending Barangay Approval`
- **Barangay**: Banlic

### Testing Steps

1. **Test Barangay Level Rejection**
   - Login as Barangay President (Banlic)
   - Go to PWD Records
   - Find application for Richard Carandang
   - Click "Reject"
   - Select rejection reason
   - Add remarks
   - Submit rejection
   - Verify email sent to richardcarandangjr@gmail.com
   - Verify application status changed to "Rejected"

2. **Test Admin Level Rejection**
   - First approve application at barangay level
   - Login as Admin/SuperAdmin
   - Go to PWD Records
   - Find application for Richard Carandang (status: Pending Admin Approval)
   - Click "Reject"
   - Select rejection reason
   - Add remarks
   - Submit rejection
   - Verify email sent
   - Verify notifications sent to other admins

3. **Test Assessment Level Rejection**
   - Approve at barangay level
   - Schedule assessment (or mark as completed)
   - Login as Admin/SuperAdmin
   - Go to PWD Records
   - Find application (status: For Assessment or Pending Admin Approval)
   - Click "Reject"
   - Select "does_not_meet_criteria" reason
   - Add assessment-specific remarks
   - Submit rejection
   - Verify email sent with assessment rejection details

---

## API Response Format

### Success Response
```json
{
  "message": "Application rejected successfully",
  "application": {
    "applicationID": "APP-000123",
    "status": "Rejected",
    "remarks": "Rejection Reason: Does Not Meet Criteria\n\nRemarks:\nAssessment results indicate...",
    "referenceNumber": "REF-ABC12345",
    "email": "applicant@example.com"
  }
}
```

### Error Response
```json
{
  "error": "Validation failed",
  "messages": {
    "remarks": ["The remarks field is required."],
    "rejectionReason": ["The rejection reason field is required."]
  }
}
```

---

## Notes

1. **Rejection is Final**: Once rejected, the application cannot be automatically approved. Applicant must resubmit.

2. **Multiple Rejections**: An applicant can be rejected multiple times. Each rejection is logged with timestamp and reviewer.

3. **Appeal Process**: Currently, appeals require resubmission. Future enhancement could include formal appeal workflow.

4. **Email Delivery**: Email notifications use SMTP (Gmail). If email fails, rejection still proceeds but error is logged.

5. **Notification Timing**: All notifications are sent immediately upon rejection.

