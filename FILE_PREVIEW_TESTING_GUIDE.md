# File Preview Testing Guide

## Overview
This guide provides comprehensive testing instructions for the fixed file preview functionality across all user account types in the PWD RMS application.

## Test Scenarios

### 1. Admin Account Testing
**Login as Admin user and test:**

#### Support Ticket File Preview
1. Navigate to Admin Support Desk
2. Create or find a support ticket with file attachment
3. Click "Preview" button on attachment
4. Verify file opens in new tab with proper authentication
5. Test with different file types: PDF, images, documents

#### Application File Preview
1. Navigate to PWD Records
2. Select an application with uploaded documents
3. Click "View" button for different file types (ID Picture, Medical Certificate, etc.)
4. Verify files open correctly with proper headers

#### Document Management File Preview
1. Navigate to Document Management
2. Go to "Pending Reviews" tab
3. Click "View" button on uploaded documents
4. Verify files open with proper authentication

### 2. PWD Member Account Testing
**Login as PWD Member and test:**

#### Support Ticket File Preview
1. Navigate to Support Desk
2. Create a support ticket with file attachment
3. Click "Preview" button on attachment
4. Verify file opens correctly (should only see own files)

#### Document Upload Preview
1. Navigate to Document Management
2. Upload a document
3. Test preview functionality for uploaded files
4. Verify access is restricted to own documents only

### 3. Barangay President Account Testing
**Login as Barangay President and test:**

#### Application File Preview
1. Navigate to PWD Records
2. Select applications from their barangay
3. Test file preview for application documents
4. Verify access is restricted to their barangay's applications

### 4. Cross-Account Security Testing

#### Unauthorized Access Prevention
1. Try accessing files from other users' applications
2. Verify 403 Forbidden errors for unauthorized access
3. Test token-based authentication works correctly

#### File Type Support Testing
Test with various file types:
- **Images**: JPG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX
- **Text**: TXT, CSV
- **Unsupported types**: Should show appropriate message

### 5. Error Handling Testing

#### File Not Found Scenarios
1. Test with deleted/moved files
2. Verify proper error messages are displayed
3. Check that 404 errors are handled gracefully

#### Network Error Testing
1. Test with poor network connection
2. Verify loading states are shown
3. Check error recovery mechanisms

## Technical Verification

### Backend Endpoints
Verify these endpoints work correctly:
- `/api/support-tickets/messages/{messageId}/download`
- `/api/application-file/{applicationId}/{fileType}`
- `/api/documents/file/{id}`

### Authentication
- Token-based authentication works for file preview URLs
- Proper permission checks are enforced
- Unauthorized access is blocked

### File Headers
Verify proper headers are set:
- `Content-Type`: Correct MIME type
- `Content-Disposition`: `inline` for preview
- `Cache-Control`: Appropriate caching
- `Content-Length`: File size

## Expected Results

### ✅ Success Criteria
1. All file previews open correctly across all user types
2. Authentication works seamlessly with token-based system
3. Proper error handling for missing/unauthorized files
4. Consistent user experience across different components
5. Security is maintained (users can only access authorized files)

### ❌ Common Issues Fixed
1. **Hardcoded URLs**: Now uses dynamic API base URLs
2. **Authentication Problems**: Token-based auth implemented
3. **Inconsistent Approaches**: Unified file preview service
4. **File Path Issues**: Improved backend file resolution
5. **Error Handling**: Better error messages and recovery

## Browser Compatibility
Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Testing
- Large file handling (10MB+ files)
- Multiple concurrent file previews
- Network latency scenarios
- Memory usage with multiple previews

## Security Testing
- XSS prevention in file names
- CSRF protection
- File type validation
- Access control enforcement
- Token expiration handling
