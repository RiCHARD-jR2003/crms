# PWD Member Test Accounts Summary

## Login Credentials
- **Email:** `nhoelsarino@gmail.com`
- **Password:** `Test123!@#`

**Note:** All accounts use the same email but different usernames. The email uniqueness constraint has been removed for test accounts.

---

## Test Accounts List

### 1. **test_member_new**
- **Description:** New Member - No Application
- **Barangay:** Banlic
- **Status:** Active
- **Application:** None
- **Test Cases:**
  - View empty dashboard
  - Submit new application
  - View application form
  - Upload required documents

---

### 2. **test_member_pending**
- **Description:** Pending Application Member
- **Barangay:** Banlic
- **Status:** Active
- **Application Status:** Pending Barangay Approval
- **Test Cases:**
  - View dashboard with pending application
  - View application details
  - Receive status change notifications
  - Cannot claim benefits yet

---

### 3. **test_member_approved**
- **Description:** Approved Member - No ID Card Yet
- **Barangay:** Banlic
- **Status:** Active
- **Application Status:** Approved
- **PWD ID:** PWD-000038 (Generated but not claimed)
- **Test Cases:**
  - View dashboard as approved member
  - See "ID Ready for Claiming" notification
  - View profile with PWD ID number
  - Cannot claim benefits (ID not claimed)

---

### 4. **test_member_active**
- **Description:** Active Member with ID Card
- **Barangay:** Banlic
- **Status:** Active
- **Application Status:** Approved
- **PWD ID:** PWD-000039 (Claimed)
- **Test Cases:**
  - View full dashboard with all features
  - View announcements
  - Claim benefits via QR scanning
  - View benefit eligibility
  - Submit support tickets
  - View documents

---

### 5. **test_member_assessment**
- **Description:** Member with Pending Assessment
- **Barangay:** Banlic
- **Status:** Active
- **Application Status:** For Assessment
- **Assessment Status:** Pending
- **Test Cases:**
  - View dashboard showing assessment pending
  - Receive assessment scheduling notification
  - View assessment appointment details
  - Cannot claim benefits (assessment pending)

---

### 6. **test_member_assessed**
- **Description:** Member with Completed Assessment
- **Barangay:** Banlic
- **Status:** Active
- **Application Status:** Pending Admin Approval
- **Assessment Status:** Completed
- **Test Cases:**
  - View dashboard showing assessment completed
  - View assessment PDF/document
  - Receive notification that assessment is complete
  - Application ready for admin approval

---

### 7. **test_member_other_barangay**
- **Description:** Member from Different Barangay
- **Barangay:** Mamatid
- **Status:** Active
- **Application Status:** Approved
- **PWD ID:** PWD-000042 (Claimed)
- **Test Cases:**
  - View announcements filtered by Mamatid barangay
  - Should NOT see Banlic-specific announcements
  - Claim benefits available for Mamatid
  - Test barangay filtering

---

### 8. **test_member_rejected**
- **Description:** Member with Rejected Application
- **Barangay:** Banlic
- **Status:** Active
- **Application Status:** Rejected
- **Rejection Remarks:** "Test rejection - Incomplete documents"
- **Test Cases:**
  - View dashboard showing rejected status
  - Receive rejection notification with remarks
  - Cannot claim benefits
  - Can submit new application

---

### 9. **test_member_with_benefits**
- **Description:** Member with Benefits Claimed
- **Barangay:** Banlic
- **Status:** Active
- **Application Status:** Approved
- **PWD ID:** PWD-000044 (Claimed)
- **Has Claimed Benefits:** Yes
- **Test Cases:**
  - View dashboard showing claimed benefits count
  - View benefit claim history
  - Cannot claim same benefit twice
  - Test QR scanning for benefits

---

### 10. **test_member_renewal**
- **Description:** Member Needing ID Renewal
- **Barangay:** Banlic
- **Status:** Active
- **Application Status:** Approved
- **PWD ID:** PWD-000045 (Claimed)
- **ID Expiry:** Near expiry
- **Test Cases:**
  - Receive renewal reminder notifications
  - Submit ID renewal request
  - View renewal status
  - Track renewal application

---

## Database Changes Made

1. **Migration Applied:** `2025_12_10_000000_allow_duplicate_emails_for_test_accounts.php`
   - Removed unique constraint on `email` column in `users` table
   - Added index on `email` for performance (allows duplicates)

2. **Note:** The `application` table still has a unique constraint on `email`. The script handles this by deleting old applications with the same email before creating new ones.

---

## Usage Instructions

1. **Login:** Use any username from the list above with email `nhoelsarino@gmail.com` and password `Test123!@#`

2. **Testing:** Each account is set up to test specific scenarios and features

3. **Reset:** Run `php create_test_member_accounts.php` again to reset all accounts to their initial state

---

## Important Notes

- All accounts share the same email address for testing purposes
- Each account has a unique username
- Password is the same for all accounts: `Test123!@#`
- Some accounts may need additional setup (e.g., ID claiming, benefit claims) depending on your testing needs

