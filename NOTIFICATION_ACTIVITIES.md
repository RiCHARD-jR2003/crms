# Notification Activities by User Type

This document lists all activities that generate notifications displayed in the notification panel for each user type in the PWD Management System.

---

## 📋 **PWDMember (PWD Member)**

### Application & Registration Activities
1. **`new_application`** - When a new application is submitted
   - Redirects to: `/profile`
   
2. **`application_status_change`** - When application status changes
   - Statuses: Pending Admin Approval, Approved, For Claiming, Rejected
   - Redirects to: `/profile`
   - Includes application ID in query params

3. **`member_welcome`** - Welcome notification when application is approved
   - Includes PWD ID, card processing info (5-7 business days)
   - Redirects to: `/profile`

### ID Card Activities
4. **`id_claiming`** - When PWD ID is ready for claiming
   - Redirects to: `/profile`
   
5. **`id_ready`** - When ID card is ready for pickup
   - Redirects to: `/profile`
   
6. **`id_claimed`** - When ID card has been successfully claimed
   - Includes receipt number
   - Redirects to: `/profile`
   
7. **`id_claim_initiated`** - When ID claim process is started
   - Redirects to: `/profile` (default)

8. **`card_ready_for_pickup`** - When card is ready for pickup
   - Redirects to: `/profile`

9. **`card_claimed`** - When card is claimed
   - Redirects to: `/profile` (default)

10. **`card_renewed`** - When card is renewed
    - Redirects to: `/profile` (default)

### Renewal Activities
11. **`renewal_submitted`** - When ID renewal request is submitted
    - Redirects to: `/profile`
    
12. **`renewal_approved`** - When ID renewal is approved
    - Includes new expiration date
    - Redirects to: `/profile`
    
13. **`renewal_rejected`** - When ID renewal is rejected
    - Includes rejection reason
    - Redirects to: `/profile`
    
14. **`renewal_reminder`** - Reminder when card renewal is due
    - Redirects to: `/profile`
    
15. **`id_renewal`** - General ID renewal notifications
    - Redirects to: `/profile`
    
16. **`card_renewal_due`** - When card is due for renewal (from scheduled command)
    - Redirects to: `/profile` (default)

### Document Activities
17. **`document_upload`** - When a document is uploaded
    - Redirects to: `/documents`
    
18. **`document_review`** - When document review status changes
    - Status: approved/rejected
    - Redirects to: `/documents`
    - Includes document ID in query params

### Support Activities
19. **`support_ticket_reply`** - When admin replies to support ticket
    - Redirects to: `/pwd-support`
    - Includes ticket ID in query params

### Announcement & Benefits
20. **`announcement`** - System announcements
    - Redirects to: `/dashboard`
    - Includes announcement ID in query params
    
21. **`benefit_announcement`** - New benefit announcements
    - Redirects to: `/benefits`
    - Includes announcement ID in query params
    
22. **`benefit_eligibility`** - When eligible for a benefit
    - Redirects to: `/benefits`
    - Includes benefit ID in query params

---

## 🏛️ **BarangayPresident (Barangay President)**

### Application Activities
1. **`new_application`** - When new application is submitted in their barangay
   - Redirects to: `/barangay-president-pwd-records`
   - Includes application ID in query params

2. **`application_status_change`** - When application status changes
   - Redirects to: `/barangay-president-pwd-records`
   - Includes application ID in query params

### Support Activities
3. **`support_ticket_reply`** - Support ticket updates
   - Redirects to: `/barangay-support`
   - Includes ticket ID in query params

### Announcement & Benefits
4. **`announcement`** - System announcements
   - Redirects to: `/barangay-president-announcement`
   - Includes announcement ID in query params
   
5. **`benefit_announcement`** - Benefit announcements
   - Redirects to: `/barangay-president-announcement`
   - Includes announcement ID in query params

---

## 👨‍💼 **Admin**

### Application Activities
1. **`new_application`** - When new PWD application is submitted
   - Redirects to: `/pwd-records`
   - Includes application ID in query params

2. **`application_status_change`** - When application status changes (Approved/Rejected/For Claiming)
   - Notifies all admins when one admin approves/rejects
   - Redirects to: `/pwd-records`
   - Includes application ID in query params

### ID Card Activities
3. **`id_claiming`** - When ID claim is initiated
   - Redirects to: `/pwd-card`
   - Includes claim ID in query params

4. **`id_claimed`** - When ID claim is completed
   - Includes receipt number
   - Redirects to: `/pwd-card` (default)
   - Includes claim ID in query params

### Renewal Activities
5. **`id_renewal`** - ID renewal notifications
   - Includes: New renewal requests, approvals, rejections
   - Redirects to: `/pwd-records`
   - Includes renewal ID in query params

### Document Activities
6. **`document_upload`** - When PWD member uploads a document
   - Redirects to: `/document-management`
   
7. **`document_review`** - When document is reviewed (approved/rejected)
   - Notifies other admins when one admin reviews
   - Redirects to: `/document-management`
   - Includes document ID in query params

### Support Activities
8. **`support_ticket_reply`** - When PWD member creates new support ticket
   - Redirects to: `/admin-support`
   - Includes ticket ID in query params

### Announcement & Benefits
9. **`announcement`** - System announcements
   - Redirects to: `/announcement`
   - Includes announcement ID in query params
   
10. **`benefit_announcement`** - Benefit announcements
    - Redirects to: `/ayuda`
    - Includes announcement ID in query params
    
11. **`benefit_eligibility`** - Benefit eligibility updates
    - Redirects to: `/ayuda`
    - Includes benefit ID in query params

---

## 🔐 **SuperAdmin**

### Application Activities
1. **`new_application`** - When new PWD application is submitted
   - Redirects to: `/pwd-records`
   - Includes application ID in query params

2. **`application_status_change`** - When application status changes (Approved/Rejected/For Claiming)
   - Notifies all admins when one admin approves/rejects
   - Redirects to: `/pwd-records`
   - Includes application ID in query params

### ID Card Activities
3. **`id_claiming`** - When ID claim is initiated
   - Redirects to: `/pwd-card`
   - Includes claim ID in query params

4. **`id_claimed`** - When ID claim is completed
   - Includes receipt number
   - Redirects to: `/pwd-card` (default)
   - Includes claim ID in query params

### Renewal Activities
5. **`id_renewal`** - ID renewal notifications
   - Includes: New renewal requests, approvals, rejections
   - Redirects to: `/pwd-records`
   - Includes renewal ID in query params

### Document Activities
6. **`document_upload`** - When PWD member uploads a document
   - Redirects to: `/document-management`
   
7. **`document_review`** - When document is reviewed (approved/rejected)
   - Notifies other admins when one admin reviews
   - Redirects to: `/document-management`
   - Includes document ID in query params

### Support Activities
8. **`support_ticket_reply`** - When PWD member creates new support ticket
   - Redirects to: `/admin-support`
   - Includes ticket ID in query params

### Announcement & Benefits
9. **`announcement`** - System announcements
   - Redirects to: `/announcement`
   - Includes announcement ID in query params
   
10. **`benefit_announcement`** - Benefit announcements
    - Redirects to: `/ayuda`
    - Includes announcement ID in query params
    
11. **`benefit_eligibility`** - Benefit eligibility updates
    - Redirects to: `/ayuda`
    - Includes benefit ID in query params

---

## 🖥️ **FrontDesk**

### Application Activities
1. **`new_application`** - When new PWD application is submitted
   - Redirects to: `/pwd-records`
   - Includes application ID in query params

2. **`application_status_change`** - When application status changes
   - Redirects to: `/pwd-records`
   - Includes application ID in query params

### ID Card Activities
3. **`id_claiming`** - When ID claim is initiated
   - Redirects to: `/pwd-card`
   - Includes claim ID in query params

### Support Activities
4. **`support_ticket_reply`** - Support ticket updates
   - Redirects to: `/frontdesk-support`
   - Includes ticket ID in query params

### Announcement
5. **`announcement`** - System announcements
   - Redirects to: `/announcement`
   - Includes announcement ID in query params

---

## 👤 **Staff1**

### Application Activities
1. **`new_application`** - When new PWD application is submitted
   - Redirects to: `/pwd-masterlist`
   - Includes application ID in query params

2. **`application_status_change`** - When application status changes
   - Redirects to: `/pwd-masterlist`
   - Includes application ID in query params

### ID Card Activities
3. **`id_claiming`** - When ID claim is initiated
   - Redirects to: `/pwd-card`
   - Includes claim ID in query params

### Renewal Activities
4. **`id_renewal`** - ID renewal notifications
   - Redirects to: `/pwd-masterlist`
   - Includes renewal ID in query params

### Document Activities
5. **`document_upload`** - When PWD member uploads a document
   - Redirects to: `/document-management`
   
6. **`document_review`** - When document is reviewed
   - Redirects to: `/document-management`
   - Includes document ID in query params

### Support Activities
7. **`support_ticket_reply`** - Support ticket updates
   - Redirects to: `/admin-support`
   - Includes ticket ID in query params

### Announcement
8. **`announcement`** - System announcements
   - Redirects to: `/announcement`
   - Includes announcement ID in query params

---

## 👥 **Staff2**

### Announcement & Benefits
1. **`announcement`** - System announcements
   - Redirects to: `/announcement`
   - Includes announcement ID in query params
   
2. **`benefit_announcement`** - Benefit announcements
   - Redirects to: `/staff2-ayuda`
   - Includes announcement ID in query params
    
3. **`benefit_eligibility`** - Benefit eligibility updates
   - Redirects to: `/staff2-ayuda`
   - Includes benefit ID in query params

### Support Activities
4. **`support_ticket_reply`** - Support ticket updates
   - Redirects to: `/admin-support`
   - Includes ticket ID in query params

---

## 📊 **Summary by Activity Type**

### Application-Related Notifications
- **PWDMember**: `new_application`, `application_status_change`, `member_welcome`
- **BarangayPresident**: `new_application`, `application_status_change`
- **Admin/SuperAdmin**: `new_application`, `application_status_change` (all admins notified)
- **FrontDesk**: `new_application`, `application_status_change`
- **Staff1**: `new_application`, `application_status_change`

### ID Card & Claiming Notifications
- **PWDMember**: `id_claiming`, `id_ready`, `id_claimed`, `id_claim_initiated`, `card_ready_for_pickup`, `card_claimed`, `card_renewed`
- **Admin/SuperAdmin**: `id_claiming`, `id_claimed` (when initiated/completed)
- **FrontDesk**: `id_claiming`
- **Staff1**: `id_claiming`

### Renewal Notifications
- **PWDMember**: `renewal_submitted`, `renewal_approved`, `renewal_rejected`, `renewal_reminder`, `id_renewal`, `card_renewal_due`
- **Admin/SuperAdmin**: `id_renewal` (new requests, approvals, rejections - all admins notified)
- **Staff1**: `id_renewal`

### Document Notifications
- **PWDMember**: `document_upload`, `document_review`
- **Admin/SuperAdmin**: `document_upload` (when member uploads), `document_review` (when reviewed by other admin)
- **Staff1**: `document_upload`, `document_review`

### Support Ticket Notifications
- **PWDMember**: `support_ticket_reply` (when admin replies)
- **BarangayPresident**: `support_ticket_reply`
- **Admin/SuperAdmin**: `support_ticket_reply` (when member creates ticket)
- **FrontDesk**: `support_ticket_reply`
- **Staff1**: `support_ticket_reply`
- **Staff2**: `support_ticket_reply`

### Announcement & Benefit Notifications
- **PWDMember**: `announcement`, `benefit_announcement`, `benefit_eligibility`
- **BarangayPresident**: `announcement`, `benefit_announcement`
- **Admin/SuperAdmin**: `announcement`, `benefit_announcement`, `benefit_eligibility`
- **FrontDesk**: `announcement`
- **Staff1**: `announcement`
- **Staff2**: `announcement`, `benefit_announcement`, `benefit_eligibility`

---

## 🔔 **Notification Features**

### All User Types
- ✅ Badge count shows unread notifications (doesn't decrease until marked as read)
- ✅ All notifications are clickable and redirect to relevant pages
- ✅ Notifications sorted by date (newest first)
- ✅ Visual indicators for unread notifications (blue border, bold text, dot indicator)
- ✅ "Mark as read" button for individual notifications
- ✅ "Mark all as read" button
- ✅ Auto-refresh every 30 seconds when panel is open
- ✅ Proper icons for each notification type

### Admin/SuperAdmin Specific
- ✅ Receive notifications for all major activities requiring their attention
- ✅ Notified when other admins complete actions (for transparency)
- ✅ Comprehensive coverage of all system activities

